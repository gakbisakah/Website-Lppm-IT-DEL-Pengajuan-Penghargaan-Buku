<?php

namespace Tests\Feature\Controllers\Home;

use App\Helper\ToolsHelper;
use App\Http\Controllers\App\Home\HomeController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class HomeControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mockery::close();

        // Mock Inertia::always untuk mengembalikan nilai yang diinginkan
        Inertia::shouldReceive('always')
            ->andReturnUsing(function ($value) {
                return Mockery::mock('overload:Inertia\AlwaysProp', [
                    'getValue' => $value,
                ]);
            });
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function index_menampilkan_halaman_beranda_dengan_data_lengkap()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $authData = ['user' => ['id' => 1, 'name' => 'Test User']];
        $authToken = 'fake-token-123';

        $request = Request::create('/', 'GET');
        $request->attributes->set('auth', $authData);

        ToolsHelper::setAuthToken($authToken);

        $mockResponse = Mockery::mock(Response::class);

        Inertia::shouldReceive('render')
            ->once()
            ->with('app/home/home-page', Mockery::any())
            ->andReturn($mockResponse);

        $controller = new HomeController;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $controller->index($request);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertSame($mockResponse, $response);
    }

    #[Test]
    public function index_berhasil_dengan_auth_kosong()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $authToken = 'fake-token-456';

        $request = Request::create('/', 'GET');
        // Tidak set auth attribute

        ToolsHelper::setAuthToken($authToken);

        $mockResponse = Mockery::mock(Response::class);

        Inertia::shouldReceive('render')
            ->once()
            ->with('app/home/home-page', Mockery::any())
            ->andReturn($mockResponse);

        $controller = new HomeController;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $controller->index($request);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertSame($mockResponse, $response);
    }
}
