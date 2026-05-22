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

class NotificationSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationIcon = 'heroicon-o-bell-alert';

    protected static ?string $navigationLabel = 'Notifications';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 2;

    protected static string $view = 'filament.pages.notification-settings';

    protected static ?string $title = 'Notification Channels';

    public ?array $data = [];

    public static function shouldRegisterNavigation(): bool
    {
        return Auth::user()?->isSuperAdmin() ?? false;
    }

    public function mount(): void
    {
        $this->form->fill([
            'whatsapp_enabled' => (bool) Setting::get('notify.whatsapp_enabled', false),
            'sms_enabled' => (bool) Setting::get('notify.sms_enabled', false),
            'email_enabled' => (bool) Setting::get('notify.email_enabled', true),
            'twilio_account_sid' => Setting::get('twilio.account_sid', ''),
            'twilio_auth_token' => Setting::get('twilio.auth_token', ''),
            'twilio_from' => Setting::get('twilio.from', ''),
            'twilio_whatsapp_from' => Setting::get('twilio.whatsapp_from', ''),
            'resend_api_key' => Setting::get('resend.api_key', ''),
            'mail_from_address' => Setting::get('mail.from_address', ''),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->statePath('data')
            ->schema([
                Forms\Components\Section::make('Global Channels')
                    ->description('Enable or disable platform-wide notification channels.')
                    ->schema([
                        Forms\Components\Toggle::make('email_enabled')->label('Email alerts'),
                        Forms\Components\Toggle::make('whatsapp_enabled')->label('WhatsApp alerts'),
                        Forms\Components\Toggle::make('sms_enabled')->label('SMS alerts'),
                    ])->columns(3),

                Forms\Components\Section::make('Twilio (WhatsApp + SMS)')
                    ->schema([
                        Forms\Components\TextInput::make('twilio_account_sid')->label('Account SID'),
                        Forms\Components\TextInput::make('twilio_auth_token')->label('Auth Token')->password()->revealable(),
                        Forms\Components\TextInput::make('twilio_from')->label('SMS From number')->placeholder('+1...'),
                        Forms\Components\TextInput::make('twilio_whatsapp_from')->label('WhatsApp From')->placeholder('whatsapp:+1...'),
                    ])->columns(2)->collapsible(),

                Forms\Components\Section::make('Resend (Email)')
                    ->schema([
                        Forms\Components\TextInput::make('resend_api_key')->label('API Key')->password()->revealable(),
                        Forms\Components\TextInput::make('mail_from_address')->label('From email')->email(),
                    ])->columns(2)->collapsible(),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        Setting::set('notify.email_enabled', (bool) $data['email_enabled']);
        Setting::set('notify.whatsapp_enabled', (bool) $data['whatsapp_enabled']);
        Setting::set('notify.sms_enabled', (bool) $data['sms_enabled']);
        Setting::set('twilio.account_sid', $data['twilio_account_sid'] ?? '');
        Setting::set('twilio.auth_token', $data['twilio_auth_token'] ?? '');
        Setting::set('twilio.from', $data['twilio_from'] ?? '');
        Setting::set('twilio.whatsapp_from', $data['twilio_whatsapp_from'] ?? '');
        Setting::set('resend.api_key', $data['resend_api_key'] ?? '');
        Setting::set('mail.from_address', $data['mail_from_address'] ?? '');

        Notification::make()->title('Notification settings saved')->success()->send();
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save changes')
                ->submit('save'),
        ];
    }
}
