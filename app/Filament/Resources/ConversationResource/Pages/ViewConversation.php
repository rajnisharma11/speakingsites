<?php

namespace App\Filament\Resources\ConversationResource\Pages;

use App\Filament\Resources\ConversationResource;
use App\Jobs\ExtractLeadDetails;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewConversation extends ViewRecord
{
    protected static string $resource = ConversationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('extract_lead')
                ->label('Extract lead details')
                ->icon('heroicon-o-cpu-chip')
                ->color('info')
                ->visible(fn () => filled(config('services.anthropic.key')))
                ->requiresConfirmation()
                ->modalHeading('Run Claude extraction')
                ->modalDescription('Reads the current transcript and fills visitor name, email, phone, urgency, summary, and suggested action. Existing non-empty fields are kept.')
                ->modalSubmitActionLabel('Extract')
                ->action(function (): void {
                    ExtractLeadDetails::dispatch($this->record->id);
                    Notification::make()
                        ->title('Extraction queued')
                        ->body('Claude is reading the transcript. Refresh in a moment.')
                        ->success()
                        ->send();
                }),
        ];
    }
}
