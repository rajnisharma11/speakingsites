-- =============================================================================
-- SpeakingSites — Initial Supabase / Postgres schema
-- =============================================================================
-- Port of the Laravel/MySQL migrations under database/migrations/ into a single
-- Postgres script for Supabase. Paste-and-run in Supabase SQL Editor.
--
-- Design notes:
--   * IDs use `bigint generated always as identity` (modern Postgres equivalent
--     of Laravel `$table->id()` / MySQL bigint auto_increment).
--   * MySQL `ENUM` -> native Postgres `CREATE TYPE ... AS ENUM`.
--   * `mediumText` / `longText`  -> Postgres `text` (no length limits).
--   * `json` -> `jsonb` (indexable, faster, the Postgres default choice).
--   * Timestamps -> `timestamptz` with `DEFAULT now()` and a shared
--     `set_updated_at()` trigger for `updated_at`.
--   * `morphs(name)` -> `<name>_type text` + `<name>_id bigint` + composite idx.
--   * `notifications.id` -> native `uuid` with `gen_random_uuid()` (pgcrypto).
--   * The later Laravel migrations that ALTER TABLE (audio_url / avatar_type /
--     sector / role enum extension) are folded into the CREATE TABLE here, so
--     this is the final shape — not a 1:1 replay of the migration history.
--   * `clients` is created before `users` so the FK can be declared inline.
--   * RLS is left OFF. The bottom of this file has commented-out RLS scaffolding
--     for when you decide on the Supabase Auth model.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
-- CREATE EXTENSION IF NOT EXISTS vector;  -- enable if you want pgvector embeddings (see knowledge_chunks below)

-- -----------------------------------------------------------------------------
-- Enum types
-- -----------------------------------------------------------------------------
CREATE TYPE user_role          AS ENUM ('super_admin', 'client_owner', 'client');
CREATE TYPE client_status      AS ENUM ('active', 'suspended');
CREATE TYPE knowledge_source_type AS ENUM ('pdf', 'url', 'docx', 'text');
CREATE TYPE conversation_status AS ENUM ('new', 'contacted', 'booked', 'lost');
CREATE TYPE message_role       AS ENUM ('user', 'assistant', 'system');

-- -----------------------------------------------------------------------------
-- Shared trigger function: keep updated_at fresh on UPDATE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------
CREATE TABLE clients (
    id                         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_name              text        NOT NULL,
    sector                     varchar(64),
    logo_url                   text,
    primary_colour             varchar(16) NOT NULL DEFAULT '#4f46e5',
    heygen_avatar_id           text,
    greeting_message           text,
    embed_api_key              varchar(64) NOT NULL UNIQUE,
    status                     client_status NOT NULL DEFAULT 'active',
    notification_whatsapp      text,
    notification_sms           text,
    notification_email         text,
    notify_whatsapp_enabled    boolean NOT NULL DEFAULT false,
    notify_sms_enabled         boolean NOT NULL DEFAULT false,
    notify_email_enabled       boolean NOT NULL DEFAULT true,
    created_at                 timestamptz NOT NULL DEFAULT now(),
    updated_at                 timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clients_status_idx ON clients (status);
CREATE INDEX clients_sector_idx ON clients (sector);
CREATE TRIGGER clients_set_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- users   (Laravel auth users; not Supabase auth.users)
-- -----------------------------------------------------------------------------
-- If/when you migrate to Supabase Auth, the idiomatic pattern is a `profiles`
-- table whose `id uuid` references `auth.users(id)`. For now this mirrors the
-- Laravel table 1:1 so existing app logic keeps working.
CREATE TABLE users (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name              text         NOT NULL,
    email             text         NOT NULL UNIQUE,
    email_verified_at timestamptz,
    password          text         NOT NULL,
    role              user_role    NOT NULL DEFAULT 'client_owner',
    client_id         bigint       REFERENCES clients(id) ON DELETE SET NULL,
    remember_token    varchar(100),
    created_at        timestamptz  NOT NULL DEFAULT now(),
    updated_at        timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX users_role_idx      ON users (role);
CREATE INDEX users_client_id_idx ON users (client_id);
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- password_reset_tokens
-- -----------------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    email      text PRIMARY KEY,
    token      text NOT NULL,
    created_at timestamptz
);

-- -----------------------------------------------------------------------------
-- sessions   (Laravel database session driver)
-- -----------------------------------------------------------------------------
CREATE TABLE sessions (
    id            text    PRIMARY KEY,
    user_id       bigint  REFERENCES users(id) ON DELETE CASCADE,
    ip_address    varchar(45),
    user_agent    text,
    payload       text    NOT NULL,
    last_activity integer NOT NULL
);
CREATE INDEX sessions_user_id_idx       ON sessions (user_id);
CREATE INDEX sessions_last_activity_idx ON sessions (last_activity);

-- -----------------------------------------------------------------------------
-- cache + cache_locks   (Laravel database cache driver)
-- -----------------------------------------------------------------------------
CREATE TABLE cache (
    key        text    PRIMARY KEY,
    value      text    NOT NULL,
    expiration integer NOT NULL
);
CREATE INDEX cache_expiration_idx ON cache (expiration);

CREATE TABLE cache_locks (
    key        text    PRIMARY KEY,
    owner      text    NOT NULL,
    expiration integer NOT NULL
);
CREATE INDEX cache_locks_expiration_idx ON cache_locks (expiration);

-- -----------------------------------------------------------------------------
-- jobs / job_batches / failed_jobs   (Laravel queue tables)
-- -----------------------------------------------------------------------------
CREATE TABLE jobs (
    id           bigint  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    queue        text    NOT NULL,
    payload      text    NOT NULL,
    attempts     smallint NOT NULL CHECK (attempts >= 0),
    reserved_at  bigint,
    available_at bigint  NOT NULL,
    created_at   bigint  NOT NULL
);
CREATE INDEX jobs_queue_idx ON jobs (queue);

CREATE TABLE job_batches (
    id              text    PRIMARY KEY,
    name            text    NOT NULL,
    total_jobs      integer NOT NULL,
    pending_jobs    integer NOT NULL,
    failed_jobs     integer NOT NULL,
    failed_job_ids  text    NOT NULL,
    options         text,
    cancelled_at    integer,
    created_at      integer NOT NULL,
    finished_at     integer
);

CREATE TABLE failed_jobs (
    id         bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid       text        NOT NULL UNIQUE,
    connection text        NOT NULL,
    queue      text        NOT NULL,
    payload    text        NOT NULL,
    exception  text        NOT NULL,
    failed_at  timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- knowledge_sources
-- -----------------------------------------------------------------------------
CREATE TABLE knowledge_sources (
    id                          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id                   bigint NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    source_type                 knowledge_source_type NOT NULL,
    original_filename_or_url    text NOT NULL,
    text_preview                text,
    ingested_at                 timestamptz,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX knowledge_sources_client_id_source_type_idx
    ON knowledge_sources (client_id, source_type);
CREATE TRIGGER knowledge_sources_set_updated_at
BEFORE UPDATE ON knowledge_sources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- knowledge_chunks
-- -----------------------------------------------------------------------------
-- NOTE on embeddings: Laravel stored these as JSON arrays of floats. For real
-- vector search you almost certainly want pgvector. To upgrade:
--   1) `CREATE EXTENSION vector;` at the top of this file.
--   2) Change `embedding jsonb` below to `embedding vector(1536)` (or your
--      embedding model's dimension — e.g. 768 for text-embedding-3-small@reduced,
--      1536 for text-embedding-3-small, 3072 for text-embedding-3-large).
--   3) Add an index:
--      `CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);`
--   4) Backfill from the existing JSON arrays.
CREATE TABLE knowledge_chunks (
    id          bigint  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id   bigint  NOT NULL REFERENCES clients(id)            ON DELETE CASCADE,
    source_id   bigint  NOT NULL REFERENCES knowledge_sources(id)  ON DELETE CASCADE,
    content     text    NOT NULL,
    embedding   jsonb,
    token_count integer CHECK (token_count IS NULL OR token_count >= 0),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX knowledge_chunks_client_id_source_id_idx
    ON knowledge_chunks (client_id, source_id);
CREATE TRIGGER knowledge_chunks_set_updated_at
BEFORE UPDATE ON knowledge_chunks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- conversations
-- -----------------------------------------------------------------------------
-- audio_url and avatar_type were added in a later Laravel migration; folded in.
CREATE TABLE conversations (
    id               bigint  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id        bigint  NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id       varchar(64) NOT NULL UNIQUE,
    started_at       timestamptz,
    ended_at         timestamptz,
    visitor_name     text,
    visitor_email    text,
    visitor_phone    text,
    transcript       jsonb,
    audio_url        text,
    avatar_type      varchar(64),
    summary          text,
    suggested_action text,
    urgency_flag     boolean NOT NULL DEFAULT false,
    status           conversation_status NOT NULL DEFAULT 'new',
    owner_notes      text,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conversations_urgency_flag_idx     ON conversations (urgency_flag);
CREATE INDEX conversations_status_idx           ON conversations (status);
CREATE INDEX conversations_client_id_status_idx ON conversations (client_id, status);
CREATE TRIGGER conversations_set_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------
CREATE TABLE messages (
    id              bigint  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id bigint  NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            message_role NOT NULL,
    content         text    NOT NULL,
    timestamp       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_id_timestamp_idx
    ON messages (conversation_id, timestamp);

-- -----------------------------------------------------------------------------
-- audit_log
-- -----------------------------------------------------------------------------
CREATE TABLE audit_log (
    id        bigint  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id   bigint  REFERENCES users(id) ON DELETE SET NULL,
    action    text    NOT NULL,
    metadata  jsonb,
    timestamp timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_timestamp_idx ON audit_log (timestamp);

-- -----------------------------------------------------------------------------
-- notifications   (Laravel-style polymorphic notifications)
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type            text NOT NULL,
    notifiable_type text NOT NULL,
    notifiable_id   bigint NOT NULL,
    data            text NOT NULL,
    read_at         timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_notifiable_idx
    ON notifications (notifiable_type, notifiable_id);
CREATE TRIGGER notifications_set_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- app_settings   (key/value store)
-- -----------------------------------------------------------------------------
CREATE TABLE app_settings (
    key        text PRIMARY KEY,
    value      jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER app_settings_set_updated_at
BEFORE UPDATE ON app_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- OPTIONAL: Row-Level Security
-- =============================================================================
-- Supabase exposes every public.* table through PostgREST. If the anon key
-- is used anywhere client-side, enable RLS on every table BEFORE going live
-- or your data is world-readable. Tables you only touch from a trusted
-- backend (via service_role key or direct Postgres connection) don't strictly
-- need RLS, but enabling it is the safer default.
--
-- Below is a scaffold. Uncomment + adapt once you know your auth model.
-- The examples assume you've created a `public.users` row whose id matches
-- `auth.uid()::text` somehow, or you've added an `auth_user_id uuid` column
-- to public.users that references auth.users(id). Adjust to your reality.

-- ALTER TABLE clients           ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE knowledge_chunks  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversations     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE app_settings      ENABLE ROW LEVEL SECURITY;

-- Example: a client_owner can only see their own client's conversations.
-- CREATE POLICY conversations_owner_select ON conversations
--   FOR SELECT TO authenticated
--   USING (
--     client_id = (
--       SELECT client_id FROM users WHERE id = auth.uid()::bigint
--     )
--   );

-- Example: super_admin sees everything.
-- CREATE POLICY conversations_super_admin_all ON conversations
--   FOR ALL TO authenticated
--   USING (
--     EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::bigint AND role = 'super_admin')
--   );

-- =============================================================================
-- End of schema
-- =============================================================================
