<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class DemoClientSeeder extends Seeder
{
    public function run(): void
    {
        Client::updateOrCreate(
            ['embed_api_key' => 'sk_eJf059jgseEykz46rjQrGJoYDbmSRgfqldlnzae2zOZMMQ8O'],
            [
                'business_name' => 'Plumber Demo',
                'sector' => 'plumber',
                'status' => 'active',
                'greeting_message' => 'Hi! I am the SpeakingSites demo avatar.',
            ],
        );
    }
}
