<?php

namespace App\Filament\Resources\ClientResource\Pages;

use App\Filament\Resources\ClientResource;
use Filament\Actions;
use Filament\Infolists\Components\Grid;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\ViewEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewClient extends ViewRecord
{
    protected static string $resource = ClientResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            ViewEntry::make('hero')
                ->view('filament.clients.hero')
                ->hiddenLabel(),

            ViewEntry::make('stats')
                ->view('filament.clients.stats')
                ->hiddenLabel(),

            Section::make('Recent leads')
                ->icon('heroicon-o-inbox-stack')
                ->schema([
                    ViewEntry::make('recent_leads')
                        ->view('filament.clients.recent')
                        ->hiddenLabel()
                        ->columnSpanFull(),
                ]),

            Section::make('Avatar Configuration')
                ->icon('heroicon-o-user-circle')
                ->schema([
                    TextEntry::make('heygen_avatar_id')
                        ->label('HeyGen Avatar ID')
                        ->placeholder('Not configured')
                        ->copyable()
                        ->copyMessage('Copied!'),
                    TextEntry::make('greeting_message')
                        ->label('Greeting message')
                        ->placeholder('No greeting set')
                        ->columnSpanFull(),
                ])->columns(2)
                ->collapsible(),

            Section::make('Embed API Key')
                ->icon('heroicon-o-key')
                ->description('Use this key in the embeddable widget script on the client website.')
                ->schema([
                    ViewEntry::make('embed_api_key_block')
                        ->view('filament.clients.api-key')
                        ->hiddenLabel()
                        ->columnSpanFull(),
                ]),

            Section::make('Notification Channels')
                ->icon('heroicon-o-bell-alert')
                ->schema([
                    ViewEntry::make('notifications_block')
                        ->view('filament.clients.notifications')
                        ->hiddenLabel()
                        ->columnSpanFull(),
                ]),

            Section::make('Metadata')
                ->icon('heroicon-o-information-circle')
                ->collapsible()
                ->collapsed()
                ->schema([
                    Grid::make(3)->schema([
                        TextEntry::make('id')->label('Client ID'),
                        TextEntry::make('created_at')->dateTime()->label('Created'),
                        TextEntry::make('updated_at')->dateTime()->label('Last updated'),
                    ]),
                ]),
        ]);
    }
}
