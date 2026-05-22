<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ClientResource\Pages;
use App\Models\Client;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class ClientResource extends Resource
{
    protected static ?string $model = Client::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationGroup = 'Clients';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Business Profile')
                ->schema([
                    Forms\Components\TextInput::make('business_name')
                        ->required()
                        ->maxLength(255),
                    Forms\Components\Select::make('sector')
                        ->options([
                            'plumber' => 'Plumber',
                            'lawyer' => 'Lawyer',
                            'medical' => 'Medical',
                            'builder' => 'Builder',
                            'salon' => 'Salon',
                        ])
                        ->searchable()
                        ->native(false)
                        ->helperText('Visitors matched to this sector via the widget; client-role users only see leads for their sector.'),
                    Forms\Components\FileUpload::make('logo_url')
                        ->label('Logo')
                        ->image()
                        ->directory('client-logos')
                        ->maxSize(2048),
                    Forms\Components\ColorPicker::make('primary_colour')
                        ->required()
                        ->default('#4f46e5'),
                    Forms\Components\Select::make('status')
                        ->options([
                            'active' => 'Active',
                            'suspended' => 'Suspended',
                        ])
                        ->required()
                        ->default('active'),
                ])->columns(2),

            Forms\Components\Section::make('Avatar Configuration')
                ->schema([
                    Forms\Components\TextInput::make('heygen_avatar_id')
                        ->label('HeyGen Avatar ID')
                        ->maxLength(255),
                    Forms\Components\Textarea::make('greeting_message')
                        ->rows(3)
                        ->columnSpanFull(),
                ])->columns(2),

            Forms\Components\Section::make('Embed API Key')
                ->schema([
                    Forms\Components\TextInput::make('embed_api_key')
                        ->label('Embed API Key')
                        ->disabled()
                        ->dehydrated(false)
                        ->helperText('Auto-generated. Use this in the embeddable widget script.')
                        ->maxLength(64),
                ])
                ->hiddenOn('create'),

            Forms\Components\Section::make('Notification Settings')
                ->schema([
                    Forms\Components\TextInput::make('notification_email')
                        ->email()
                        ->maxLength(255),
                    Forms\Components\Toggle::make('notify_email_enabled')
                        ->label('Email alerts enabled')
                        ->default(true),
                    Forms\Components\TextInput::make('notification_whatsapp')
                        ->label('WhatsApp number')
                        ->tel()
                        ->maxLength(255),
                    Forms\Components\Toggle::make('notify_whatsapp_enabled')
                        ->label('WhatsApp alerts enabled'),
                    Forms\Components\TextInput::make('notification_sms')
                        ->label('SMS number')
                        ->tel()
                        ->maxLength(255),
                    Forms\Components\Toggle::make('notify_sms_enabled')
                        ->label('SMS alerts enabled'),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('logo_url')
                    ->label('Logo')
                    ->circular(),
                Tables\Columns\TextColumn::make('business_name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'success' => 'active',
                        'danger' => 'suspended',
                    ]),
                Tables\Columns\TextColumn::make('conversations_count')
                    ->label('Conversations')
                    ->counts('conversations')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created at')
                    ->dateTime('M j, Y H:i')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active' => 'Active',
                        'suspended' => 'Suspended',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('toggle_status')
                    ->label(fn (Client $record) => $record->status === 'active' ? 'Suspend' : 'Activate')
                    ->icon(fn (Client $record) => $record->status === 'active' ? 'heroicon-o-pause-circle' : 'heroicon-o-play-circle')
                    ->color(fn (Client $record) => $record->status === 'active' ? 'danger' : 'success')
                    ->requiresConfirmation()
                    ->action(fn (Client $record) => $record->update([
                        'status' => $record->status === 'active' ? 'suspended' : 'active',
                    ])),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        $user = Auth::user();
        if (! $user || $user->isSuperAdmin()) {
            return $query;
        }
        if ($user->isSectorClient()) {
            $sector = $user->sector();
            if (! $sector) {
                return $query->whereRaw('1 = 0');
            }
            return $query->where('sector', $sector);
        }
        return $query->where('id', $user->client_id);
    }

    public static function canCreate(): bool
    {
        return Auth::user()?->isSuperAdmin() ?? false;
    }

    public static function canDelete($record): bool
    {
        return Auth::user()?->isSuperAdmin() ?? false;
    }

    public static function canEdit($record): bool
    {
        $user = Auth::user();
        if (! $user) {
            return false;
        }
        return $user->isSuperAdmin() || $user->isClientOwner();
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListClients::route('/'),
            'create' => Pages\CreateClient::route('/create'),
            'view' => Pages\ViewClient::route('/{record}'),
            'edit' => Pages\EditClient::route('/{record}/edit'),
        ];
    }
}
