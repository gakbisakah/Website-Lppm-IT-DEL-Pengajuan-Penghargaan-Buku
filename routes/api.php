<?php

use App\Http\Controllers\Api\ApiController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'throttle:req-limit'], function () {
    Route::get('/test-limit', function () {
        return response()->json(['status' => 'ok']);
    });

    Route::group(['middleware' => 'api.check.auth'], function () {
        Route::post('/fetch-users', [ApiController::class, 'postFetchUsers'])->name('api.fetch-users');
    });
});
