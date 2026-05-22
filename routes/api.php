<?php

use App\Http\Controllers\WidgetConversationController;
use Illuminate\Support\Facades\Route;

Route::post('/widget/conversation/start', [WidgetConversationController::class, 'start']);
Route::post('/widget/conversation/end', [WidgetConversationController::class, 'end']);
