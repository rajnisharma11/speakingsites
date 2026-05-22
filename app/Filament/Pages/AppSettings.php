<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Auth;

class AppSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'Settings';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 3;

    protected static string $view = 'filament.pages.app-settings';

    protected static ?string $title = 'Platform Settings';

    public ?array $data = [];

    public static function shouldRegisterNavigation(): bool
    {
        return Auth::user()?->isSuperAdmin() ?? false;
    }

    public function mount(): void
    {
        $this->form->fill([
            'platform_name' => Setting::get('platform.name', 'SpeakingSites'),
            'support_email' => Setting::get('platform.support_email', ''),
            'default_greeting' => Setting::get('platform.default_greeting', 'Hi! How can I help you today?'),
            'anthropic_api_key' => Setting::get('anthropic.api_key', ''),
            'anthropic_model' => Setting::get('anthropic.model', 'claude-opus-4-7'),
            'openai_api_key' => Setting::get('openai.api_key', ''),
            'heygen_api_key' => Setting::get('heygen.api_key', ''),
            'rag_chunk_size' => (int) Setting::get('rag.chunk_size', 500),
            'rag_top_k' => (int) Setting::get('rag.top_k', 5),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema([
            Forms\Components\Section::make('Platform')
                ->schema([
                    Forms\Components\TextInput::make('platform_name')->required(),
                    Forms\Components\TextInput::make('support_email')->email(),
                    Forms\Components\Textarea::make('default_greeting')->rows(2)->columnSpanFull(),
                ])->columns(2),

            Forms\Components\Section::make('AI Provider Keys')
                ->description('Stored encrypted in app_settings. Used server-side only.')
                ->schema([
                    Forms\Components\TextInput::make('anthropic_api_key')->label('Anthropic API key')->password()->revealable(),
                    Forms\Components\TextInput::make('anthropic_model')->label('Claude model'),
                    Forms\Components\TextInput::make('openai_api_key')->label('OpenAI API key (Whisper)')->password()->revealable(),
                    Forms\Components\TextInput::make('heygen_api_key')->label('HeyGen API key')->password()->revealable(),
                ])->columns(2)->collapsible(),

            Forms\Components\Section::make('RAG Tuning')
                ->schema([
                    Forms\Components\TextInput::make('rag_chunk_size')->numeric()->minValue(100)->maxValue(2000)->suffix('tokens'),
                    Forms\Components\TextInput::make('rag_top_k')->numeric()->minValue(1)->maxValue(20)->label('Top-K chunks'),
                ])->columns(2)->collapsible(),
        ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();
        foreach ([
            'platform.name' => $data['platform_name'],
            'platform.support_email' => $data['support_email'],
            'platform.default_greeting' => $data['default_greeting'],
            'anthropic.api_key' => $data['anthropic_api_key'],
            'anthropic.model' => $data['anthropic_model'],
            'openai.api_key' => $data['openai_api_key'],
            'heygen.api_key' => $data['heygen_api_key'],
            'rag.chunk_size' => (int) $data['rag_chunk_size'],
            'rag.top_k' => (int) $data['rag_top_k'],
        ] as $key => $value) {
            Setting::set($key, $value);
        }

        Notification::make()->title('Settings saved')->success()->send();
    }
}
