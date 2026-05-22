<?php

namespace App\Filament\Pages;

use App\Models\Client;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

class EmbedCodes extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-code-bracket-square';

    protected static ?string $navigationLabel = 'Embed Codes';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 3;

    protected static string $view = 'filament.pages.embed-codes';

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    public function table(Table $table): Table
    {
        $query = Client::query();
        $user = Auth::user();
        if ($user && ! $user->isSuperAdmin()) {
            $query->where('id', $user->client_id);
        }

        return $table
            ->query($query)
            ->columns([
                Tables\Columns\ImageColumn::make('logo_url')->circular(),
                Tables\Columns\TextColumn::make('business_name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors(['success' => 'active', 'danger' => 'suspended']),
                Tables\Columns\TextColumn::make('embed_api_key')
                    ->label('API Key')
                    ->limit(20)
                    ->copyable()
                    ->copyMessage('API key copied'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['active' => 'Active', 'suspended' => 'Suspended']),
            ])
            ->actions([
                Tables\Actions\Action::make('copy_script')
                    ->label('Copy embed script')
                    ->icon('heroicon-o-clipboard-document')
                    ->action(function (Client $record) {
                        $script = static::buildScript($record);
                        \Filament\Notifications\Notification::make()
                            ->title('Embed script ready')
                            ->body('Copied to clipboard.')
                            ->success()
                            ->send();
                        $this->dispatch('copy-to-clipboard', text: $script);
                    }),
                Tables\Actions\Action::make('view_script')
                    ->label('View')
                    ->icon('heroicon-o-eye')
                    ->modalHeading(fn (Client $record) => "Embed script for {$record->business_name}")
                    ->modalContent(fn (Client $record): View => view('filament.pages.embed-script-modal', [
                        'script' => static::buildScript($record),
                    ]))
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Close'),
            ]);
    }

    public static function buildScript(Client $client): string
    {
        $base = rtrim(config('app.url'), '/');
        return <<<HTML
<!-- SpeakingSites widget for {$client->business_name} -->
<script>
  window.SpeakingSites = window.SpeakingSites || {};
  window.SpeakingSites.config = {
    apiKey: "{$client->embed_api_key}",
    endpoint: "{$base}/api/widget"
  };
</script>
<script async src="{$base}/widget.js"></script>
HTML;
    }
}
