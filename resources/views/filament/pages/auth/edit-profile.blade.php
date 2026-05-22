@php
    $user = auth()->user();
    $initials = collect(explode(' ', $user->name))
        ->map(fn ($w) => mb_substr($w, 0, 1))
        ->take(2)
        ->implode('');
    $roleLabel = match ($user->role) {
        'super_admin' => 'Super Admin',
        'client_owner' => 'Client Owner',
        'client' => 'Client',
        default => ucfirst($user->role ?? 'user'),
    };
@endphp

<x-filament-panels::page>
    <div class="ss-profile-hero">
        <div class="ss-profile-hero__blob"></div>

        <div class="ss-profile-hero__inner">
            <div class="ss-profile-hero__avatar">{{ strtoupper($initials) }}</div>
            <div class="ss-profile-hero__body">
                <h2 class="ss-profile-hero__name">{{ $user->name }}</h2>
                <div class="ss-profile-hero__meta">
                    <span class="ss-pill ss-pill--ghost">{{ $roleLabel }}</span>
                    <span class="ss-profile-hero__email">{{ $user->email }}</span>
                </div>
                <div class="ss-profile-hero__sub">
                    Member since {{ $user->created_at?->format('M j, Y') }}
                    @if ($user->email_verified_at)
                        · <span class="ss-profile-hero__verified">✓ Email verified</span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <form
        id="form"
        wire:submit="save"
        class="ss-profile-form"
    >
        {{ $this->form }}

        <div class="ss-profile-actions">
            <x-filament-panels::form.actions
                :actions="$this->getFormActions()"
                :full-width="$this->hasFullWidthFormActions()"
            />
        </div>
    </form>

</x-filament-panels::page>
