<?php

namespace App\Filament\Pages\Auth;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Auth\EditProfile as BaseEditProfile;

class EditProfile extends BaseEditProfile
{
    protected static string $view = 'filament.pages.auth.edit-profile';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Profile information')
                ->description('Your name and email used for login and notifications.')
                ->icon('heroicon-o-user-circle')
                ->schema([
                    $this->getNameFormComponent()
                        ->columnSpan(1),
                    $this->getEmailFormComponent()
                        ->columnSpan(1),
                ])
                ->columns(2),

            Forms\Components\Section::make('Change password')
                ->description('Leave blank to keep your current password.')
                ->icon('heroicon-o-key')
                ->schema([
                    $this->getPasswordFormComponent()
                        ->columnSpan(2),
                    $this->getPasswordConfirmationFormComponent()
                        ->columnSpan(2),
                ])
                ->columns(2)
                ->collapsible()
                ->collapsed(),
        ]);
    }

    public function getMaxWidth(): \Filament\Support\Enums\MaxWidth|string|null
    {
        return \Filament\Support\Enums\MaxWidth::FourExtraLarge;
    }
}
