<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa HTTPS jika environment remote atau konfigurasi force_https true
        if (app()->environment('remote') || config('sdi.force_https')) {
            URL::forceScheme('https');
        }

        // Rate limiter untuk 'req-limit' (nama yang digunakan di aplikasi)
        RateLimiter::for('req-limit', function ($request) {
            // 300 requests per 5 minutes = 60 requests per minute
            return Limit::perMinute(60)
                ->by($request->ip())
                ->response(function ($request, array $headers) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Terlalu banyak percobaan. Silakan coba lagi dalam 5 menit.',
                        'retry_after' => $headers['Retry-After'] ?? null,
                    ], 429);
                });
        });

        // Rate limiter standar Laravel (opsional)
        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by($request->ip());
        });
    }
}