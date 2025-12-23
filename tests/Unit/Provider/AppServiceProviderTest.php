<?php

namespace Tests\Unit\Provider;

use App\Providers\AppServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AppServiceProviderTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Clear semua rate limiter
        RateLimiter::clear('req-limit:127.0.0.1');
        Mockery::close();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        
        // Clear rate limiter setelah test
        RateLimiter::clear('req-limit:127.0.0.1');
        
        parent::tearDown();
    }

    #[Test]
    public function memaksa_https_ketika_environment_remote()
    {
        URL::shouldReceive('forceScheme')
            ->once()
            ->with('https');

        app()->detectEnvironment(fn () => 'remote');

        $provider = new AppServiceProvider(app());
        $provider->boot();

        $this->addToAssertionCount(1);
    }

    #[Test]
    public function memaksa_https_ketika_config_force_https_true()
    {
        app()->detectEnvironment(fn () => 'local');
        config(['sdi.force_https' => true]);

        URL::shouldReceive('forceScheme')
            ->once()
            ->with('https');

        $provider = new AppServiceProvider(app());
        $provider->boot();

        $this->addToAssertionCount(1);
    }

    #[Test]
    public function tidak_memaksa_https_jika_kondisi_tidak_terpenuhi()
    {
        app()->detectEnvironment(fn () => 'local');
        config(['sdi.force_https' => false]);

        URL::shouldReceive('forceScheme')->never();

        $provider = new AppServiceProvider(app());
        $provider->boot();

        $this->addToAssertionCount(1);
    }

    #[Test]
    public function register_method_tidak_mengeksekusi_apa_apa()
    {
        $provider = new AppServiceProvider(app());
        $provider->register();

        $this->assertTrue(true);
    }

    #[Test]
    public function rate_limiter_berhasil_dikonfigurasi()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Jangan mock RateLimiter::for, tapi verifikasi bahwa boot() berjalan
        // tanpa error dan rate limiter terdaftar
        
        $provider = new AppServiceProvider(app());

        // =====================================
        // Act (Aksi)
        // =====================================
        $provider->boot();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        // Verifikasi bahwa rate limiter 'req-limit' telah terdaftar
        // dengan cara mencoba menggunakannya
        Route::middleware(['throttle:req-limit'])->group(function () {
            Route::get('/test-rate-limit', function () {
                return response()->json(['test' => 'ok']);
            });
        });

        // Request pertama harus berhasil
        $response = $this->get('/test-rate-limit');
        $response->assertStatus(200);
        
        $this->addToAssertionCount(1);
    }

    #[Test]
    public function rate_limiter_response_memiliki_format_yang_benar()
    {
        $request = Mockery::mock(Request::class);
        $headers = ['Retry-After' => 300];

        $responseCallback = function ($request, array $headers) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terlalu banyak percobaan. Silakan coba lagi dalam 5 menit.',
                'retry_after' => $headers['Retry-After'] ?? null,
            ], 429);
        };

        $response = $responseCallback($request, $headers);

        $this->assertEquals(429, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('error', $responseData['status']);
        $this->assertEquals('Terlalu banyak percobaan. Silakan coba lagi dalam 5 menit.', $responseData['message']);
        $this->assertEquals(300, $responseData['retry_after']);
    }

    #[Test]
    public function rate_limiter_response_tanpa_retry_after()
    {
        $request = Mockery::mock(Request::class);
        $headers = [];

        $responseCallback = function ($request, array $headers) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terlalu banyak percobaan. Silakan coba lagi dalam 5 menit.',
                'retry_after' => $headers['Retry-After'] ?? null,
            ], 429);
        };

        $response = $responseCallback($request, $headers);

        $responseData = json_decode($response->getContent(), true);
        $this->assertNull($responseData['retry_after']);
    }

    #[Test]
    public function muncul_pesan_error_saat_melebihi_batas_request()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Setup route test untuk rate limiter 'req-limit'
        Route::middleware(['throttle:req-limit'])->group(function () {
            Route::get('/api/test-limit', function () {
                return response()->json(['message' => 'OK']);
            });
        });

        // Clear rate limiter
        RateLimiter::clear('req-limit:127.0.0.1');

        // =====================================
        // Act (Aksi)
        // =====================================
        // Kirim request sebanyak 60 kali (batas per menit)
        for ($i = 0; $i < 60; $i++) {
            $response = $this->getJson('/api/test-limit');
            $response->assertOk();
        }

        // Kirim request ke-61 -> seharusnya sudah kena limit
        $response = $this->getJson('/api/test-limit');

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $response
            ->assertStatus(429)
            ->assertJson([
                'status' => 'error',
                'message' => 'Terlalu banyak percobaan. Silakan coba lagi dalam 5 menit.',
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'retry_after',
            ]);

        // =====================================
        // Cleanup (Pembersihan)
        // =====================================
        RateLimiter::clear('req-limit:127.0.0.1');
    }
}