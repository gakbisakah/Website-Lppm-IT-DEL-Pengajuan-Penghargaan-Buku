<?php

namespace Tests\Unit\Middleware;

use App\Helper\ToolsHelper;
use App\Http\Api\UserApi;
use App\Http\Middleware\ApiCheckTokenMiddleware;
use App\Models\HakAksesModel;
use Illuminate\Http\Request;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApiCheckTokenMiddlewareTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mockery::close();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function middleware_melanjutkan_ke_next_jika_token_valid_dan_user_ada()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $userData = (object) [
            'id' => ToolsHelper::generateId(),
            'name' => 'Test User',
            'email' => 'test@example.com',
            'roles' => ['read', 'write', 'delete'],
        ];

        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getMe')
            ->with('valid-token')
            ->andReturn((object) [
                'data' => (object) [
                    'user' => $userData,
                ],
            ]);

        $hakAksesMock = Mockery::mock('alias:'.HakAksesModel::class);
        $hakAksesMock
            ->shouldReceive('where')
            ->with('user_id', $userData->id)
            ->once()
            ->andReturnSelf();
        $hakAksesMock
            ->shouldReceive('first')
            ->once()
            ->andReturn((object) ['roles' => $userData->roles]);

        $request = Request::create('/api/protected', 'GET');
        $request->headers->set('Authorization', 'Bearer valid-token');

        $middleware = new ApiCheckTokenMiddleware;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $middleware->handle($request, function ($req) {
            return response()->json(['status' => 'success'], 200);
        });

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('success', json_decode($response->getContent())->status);
    }

    #[Test]
    public function middleware_mengembalikan_error_403_jika_token_tidak_ada()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $request = Request::create('/api/protected', 'GET');
        $middleware = new ApiCheckTokenMiddleware;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $middleware->handle($request, function () {});

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals(403, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('error', $responseData['status']);
        $this->assertEquals('Akses ditolak, token tidak disediakan', $responseData['message']);
    }

    #[Test]
    public function middleware_mengembalikan_error_403_jika_token_kosong()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $request = Request::create('/api/protected', 'GET');
        $request->headers->set('Authorization', 'Bearer ');
        $middleware = new ApiCheckTokenMiddleware;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $middleware->handle($request, function () {});

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals(403, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('error', $responseData['status']);
        $this->assertEquals('Akses ditolak, token tidak disediakan', $responseData['message']);
    }

    #[Test]
    public function middleware_mengembalikan_error_403_jika_user_tidak_ditemukan()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getMe')
            ->with('invalid-token')
            ->andReturn((object) [
                'data' => (object) [
                    // Tidak ada property 'user'
                ],
            ]);

        $request = Request::create('/api/protected', 'GET');
        $request->headers->set('Authorization', 'Bearer invalid-token');
        $middleware = new ApiCheckTokenMiddleware;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $middleware->handle($request, function () {});

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals(403, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('error', $responseData['status']);
        $this->assertEquals('Akses ditolak, token tidak valid', $responseData['message']);
    }

    #[Test]
    public function middleware_mengembalikan_error_403_jika_response_tidak_memiliki_data()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getMe')
            ->with('invalid-token')
            ->andReturn((object) [
                // Tidak ada property 'data'
            ]);

        $request = Request::create('/api/protected', 'GET');
        $request->headers->set('Authorization', 'Bearer invalid-token');
        $middleware = new ApiCheckTokenMiddleware;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $middleware->handle($request, function () {});

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals(403, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('error', $responseData['status']);
        $this->assertEquals('Akses ditolak, token tidak valid', $responseData['message']);
    }
}
