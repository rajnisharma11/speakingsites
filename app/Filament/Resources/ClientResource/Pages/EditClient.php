<?php

namespace App\Filament\Resources\ClientResource\Pages;

use App\Filament\Resources\ClientResource;
use App\Models\Client;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Str;

class EditClient extends EditRecord
{
    protected static string $resource = ClientResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),

            Actions\Action::make('toggle_status')
                ->label(fn (Client $record) => $record->status === 'active' ? 'Suspend' : 'Activate')
                ->icon(fn (Client $record) => $record->status === 'active' ? 'heroicon-o-pause-circle' : 'heroicon-o-play-circle')
                ->color(fn (Client $record) => $record->status === 'active' ? 'danger' : 'success')
                ->requiresConfirmation()
                ->action(function (Client $record) {
                    $record->update([
                        'status' => $record->status === 'active' ? 'suspended' : 'active',
                    ]);
                    Notification::make()
                        ->title('Status updated')
                        ->body("Client is now {$record->status}.")
                        ->success()
                        ->send();
                }),

            Actions\Action::make('regenerate_api_key')
                ->label('Regenerate API key')
                ->icon('heroicon-o-arrow-path')
                ->color('warning')
                ->requiresConfirmation()
                ->modalDescription('Existing widget embeds will stop working until you update them with the new key.')
                ->action(function (Client $record) {
                    $record->update(['embed_api_key' => 'sk_' . Str::random(48)]);
                    Notification::make()
                        ->title('API key regenerated')
                        ->body('Update the embed script on the client website with the new key.')
                        ->success()
                        ->send();
                    $this->fillForm();
                }),

            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }

    protected function getSavedNotificationTitle(): ?string
    {
        return 'Client updated';
    }
}
