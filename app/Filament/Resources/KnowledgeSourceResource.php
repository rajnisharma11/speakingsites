<?php

namespace App\Filament\Resources;

use App\Filament\Resources\KnowledgeSourceResource\Pages;
use App\Models\KnowledgeSource;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class KnowledgeSourceResource extends Resource
{
    protected static ?string $model = KnowledgeSource::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationIcon = 'heroicon-o-book-open';

    protected static ?string $navigationLabel = 'Knowledge Base';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('client_id')
                ->relationship('client', 'business_name')
                ->searchable()
                ->preload()
                ->required(),
            Forms\Components\Select::make('source_type')
                ->options([
                    'pdf' => 'PDF',
                    'docx' => 'DOCX',
                    'url' => 'URL',
                    'text' => 'Text',
                ])
                ->required()
                ->live(),
            Forms\Components\FileUpload::make('original_filename_or_url')
                ->label('File')
                ->directory('knowledge-base')
                ->acceptedFileTypes(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
                ->visible(fn (Forms\Get $get) => in_array($get('source_type'), ['pdf', 'docx']))
                ->required(fn (Forms\Get $get) => in_array($get('source_type'), ['pdf', 'docx'])),
            Forms\Components\TextInput::make('original_filename_or_url')
                ->label('URL')
                ->url()
                ->visible(fn (Forms\Get $get) => $get('source_type') === 'url')
                ->required(fn (Forms\Get $get) => $get('source_type') === 'url'),
            Forms\Components\Textarea::make('text_preview')
                ->label('Text content')
                ->rows(8)
                ->visible(fn (Forms\Get $get) => $get('source_type') === 'text')
                ->required(fn (Forms\Get $get) => $get('source_type') === 'text')
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('client.business_name')
                    ->label('Client')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('source_type')
                    ->badge()
                    ->colors([
                        'primary' => 'pdf',
                        'success' => 'url',
                        'info' => 'docx',
                        'gray' => 'text',
                    ]),
                Tables\Columns\TextColumn::make('original_filename_or_url')
                    ->label('Source')
                    ->limit(50)
                    ->searchable(),
                Tables\Columns\TextColumn::make('ingested_at')
                    ->dateTime()
                    ->placeholder('Not ingested')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Added')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('client_id')
                    ->relationship('client', 'business_name')
                    ->label('Client'),
                Tables\Filters\SelectFilter::make('source_type')
                    ->options([
                        'pdf' => 'PDF',
                        'docx' => 'DOCX',
                        'url' => 'URL',
                        'text' => 'Text',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
        if ($user && ! $user->isSuperAdmin()) {
            $query->where('client_id', $user->client_id);
        }
        return $query;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListKnowledgeSources::route('/'),
            'create' => Pages\CreateKnowledgeSource::route('/create'),
            'edit' => Pages\EditKnowledgeSource::route('/{record}/edit'),
        ];
    }
}
