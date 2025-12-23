<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'api.check.auth' => \App\Http\Middleware\ApiCheckTokenMiddleware::class,
            'check.auth' => \App\Http\Middleware\CheckAuthMiddleware::class,
            'handle.inertia' => \App\Http\Middleware\HandleInertiaRequests::class,
            'role' => \App\Http\Middleware\CheckRole::class, // <-- Tambahkan ini
        ]);

        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Khusus api buat json
        $exceptions->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                // JANGAN handle HttpResponseException - ini sudah punya response yang benar
                if ($e instanceof HttpResponseException) {
                    return null;
                }

                // JANGAN handle ThrottleRequestsException
                if ($e instanceof ThrottleRequestsException) {
                    return null;
                }

                $status = 500;
                if (method_exists($e, 'getCode') && is_int($e->getCode()) && $e->getCode() >= 400 && $e->getCode() < 600) {
                    $status = $e->getCode();
                }

                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                    'details' => config('app.debug') ? [
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => $e->getTrace(),
                    ] : null,
                ], $status);
            }
        });
    })
    ->create();
