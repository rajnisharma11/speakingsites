<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ConversationResource\Pages;
use App\Models\Conversation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ConversationResource extends Resource
{
    protected static ?string $model = Conversation::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Leads';

    protected static ?string $modelLabel = 'Lead';

    protected static ?string $pluralModelLabel = 'Leads';

    protected static ?string $breadcrumb = 'Leads';

    protected static ?string $slug = 'leads';

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\ViewEntry::make('hero')
                ->view('filament.conversation.hero')
                ->hiddenLabel(),

            Infolists\Components\Section::make('Recording')
                ->icon('heroicon-o-microphone')
                ->schema([
                    Infolists\Components\ViewEntry::make('audio_url')
                        ->view('filament.conversation.audio')
                        ->hiddenLabel(),
                ])
                ->visible(fn (Conversation $record) => filled($record->audio_url)),

            Infolists\Components\Section::make('Transcript')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->schema([
                    Infolists\Components\ViewEntry::make('messages')
                        ->view('filament.conversation.transcript')
                        ->hiddenLabel(),
                ]),

            Infolists\Components\Section::make('AI Summary & Suggested action')
                ->icon('heroicon-o-sparkles')
                ->schema([
                    Infolists\Components\ViewEntry::make('summary_block')
                        ->view('filament.conversation.summary')
                        ->hiddenLabel(),
                ])
                ->collapsible()
                ->collapsed(fn (Conversation $record) => blank($record->summary) && blank($record->suggested_action)),

            Infolists\Components\Section::make('Internal Notes')
                ->icon('heroicon-o-pencil-square')
                ->schema([
                    Infolists\Components\TextEntry::make('owner_notes')
                        ->hiddenLabel()
                        ->placeholder('No notes yet. Use Edit to add some.')
                        ->columnSpanFull(),
                ])
                ->collapsible()
                ->collapsed(fn (Conversation $record) => blank($record->owner_notes)),
        ]);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Visitor')
                ->schema([
                    Forms\Components\TextInput::make('visitor_name'),
                    Forms\Components\TextInput::make('visitor_email')->email(),
                    Forms\Components\TextInput::make('visitor_phone')->tel(),
                ])->columns(3),

            Forms\Components\Section::make('Lead Tracking')
                ->schema([
                    Forms\Components\Select::make('status')
                        ->options([
                            'new' => 'New',
                            'contacted' => 'Contacted',
                            'booked' => 'Booked',
                            'lost' => 'Lost',
                        ])
                        ->required(),
                    Forms\Components\Toggle::make('urgency_flag')
                        ->label('Urgent'),
                    Forms\Components\TextInput::make('suggested_action'),
                    Forms\Components\Textarea::make('owner_notes')
                        ->rows(4)
                        ->columnSpanFull(),
                ])->columns(2),

            Forms\Components\Section::make('AI Summary')
                ->schema([
                    Forms\Components\Textarea::make('summary')
                        ->rows(5)
                        ->disabled()
                        ->columnSpanFull(),
                ])
                ->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('client.business_name')
                    ->label('Client')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('visitor_name')
                    ->placeholder('Anonymous')
                    ->searchable(),
                Tables\Columns\TextColumn::make('visitor_email')
                    ->placeholder('—')
                    ->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('visitor_phone')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'gray' => 'new',
                        'warning' => 'contacted',
                        'success' => 'booked',
                        'danger' => 'lost',
                    ]),
                Tables\Columns\IconColumn::make('audio_url')
                    ->label('Audio')
                    ->boolean()
                    ->trueIcon('heroicon-o-microphone')
                    ->falseIcon('heroicon-o-minus')
                    ->trueColor('success')
                    ->falseColor('gray')
                    ->getStateUsing(fn (Conversation $record): bool => filled($record->audio_url))
                    ->tooltip(fn (Conversation $record) => filled($record->audio_url) ? 'Recording available' : 'No recording'),
                Tables\Columns\IconColumn::make('urgency_flag')
                    ->label('Urgent')
                    ->boolean(),
                Tables\Columns\TextColumn::make('started_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('client_id')
                    ->relationship('client', 'business_name')
                    ->label('Client'),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'new' => 'New',
                        'contacted' => 'Contacted',
                        'booked' => 'Booked',
                        'lost' => 'Lost',
                    ]),
                Tables\Filters\TernaryFilter::make('urgency_flag')
                    ->label('Urgent only'),
                Tables\Filters\TernaryFilter::make('has_recording')
                    ->label('Has recording')
                    ->queries(
                        true: fn (Builder $query) => $query->whereNotNull('audio_url'),
                        false: fn (Builder $query) => $query->whereNull('audio_url'),
                    ),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
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
        if (! $user) {
            return $query;
        }

        if ($user->isSuperAdmin()) {
            return $query;
        }

        if ($user->isSectorClient()) {
            $sector = $user->sector();
            if (! $sector) {
                return $query->whereRaw('1 = 0');
            }
            return $query->whereHas('client', fn ($q) => $q->where('sector', $sector));
        }

        // client_owner (and any other non-super) sees only their own client's data
        return $query->where('client_id', $user->client_id);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListConversations::route('/'),
            'view' => Pages\ViewConversation::route('/{record}'),
            'edit' => Pages\EditConversation::route('/{record}/edit'),
            'create' => Pages\CreateConversation::route('/create'),
        ];
    }
}
