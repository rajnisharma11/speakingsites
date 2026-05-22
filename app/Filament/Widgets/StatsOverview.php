<?php

namespace App\Filament\Widgets;

use App\Models\Client;
use App\Models\Conversation;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $todayLeads = Conversation::whereDate('created_at', today())->count();
        $weekLeads = Conversation::where('created_at', '>=', now()->startOfWeek())->count();

        return [
            Stat::make('Total Clients', Client::count())
                ->description('All registered tenants')
                ->descriptionIcon('heroicon-m-building-office-2')
                ->color('primary'),

            Stat::make('Active Clients', Client::where('status', 'active')->count())
                ->description('Currently active')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),

            Stat::make('Total Conversations', Conversation::count())
                ->description('All-time chat sessions')
                ->descriptionIcon('heroicon-m-chat-bubble-left-right')
                ->color('info'),

            Stat::make('Leads Today', $todayLeads)
                ->description("{$weekLeads} this week")
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('warning'),
        ];
    }
}
