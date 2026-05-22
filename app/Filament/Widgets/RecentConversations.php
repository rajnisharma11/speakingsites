<?php

namespace App\Filament\Widgets;

use App\Models\Conversation;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentConversations extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->heading('Recent Activity')
            ->query(Conversation::query()->latest()->limit(10))
            ->columns([
                Tables\Columns\TextColumn::make('client.business_name')->label('Client'),
                Tables\Columns\TextColumn::make('visitor_name')->placeholder('Anonymous'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\IconColumn::make('urgency_flag')->boolean()->label('Urgent'),
                Tables\Columns\TextColumn::make('created_at')->since(),
            ])
            ->paginated(false);
    }
}
