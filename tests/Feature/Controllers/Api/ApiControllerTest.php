<?php

namespace Tests\Feature\Controllers\Api;

use App\Http\Api\UserApi;
use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApiControllerTest extends TestCase
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
    public function post_fetch_users_berhasil_mengambil_data_pengguna()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $mockUsers = [
            (object) ['id' => 1, 'name' => 'User 1'],
            (object) ['id' => 2, 'name' => 'User 2'],
        ];

        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getUsers')
            ->with('valid-token', 'test', 5, '')
            ->andReturn((object) [
                'data' => (object) ['users' => $mockUsers],
            ]);

        $request = Request::create('/api/fetch-users', 'POST');
        $request->headers->set('Authorization', 'Bearer valid-token');
        $request->merge(['search' => 'test']);

        $controller = new ApiController;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $controller->postFetchUsers($request);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $responseData = json_decode($response->getContent());

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('success', $responseData->status);
        $this->assertEquals('Berhasil mengambil daftar pengguna', $responseData->message);
        $this->assertCount(2, $responseData->data->users);
    }

    #[Test]
    public function post_fetch_users_berhasil_dengan_data_kosong()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getUsers')
            ->with('valid-token', '', 5, '')
            ->andReturn((object) [
                'data' => (object) ['users' => []],
            ]);

        $request = Request::create('/api/fetch-users', 'POST');
        $request->headers->set('Authorization', 'Bearer valid-token');

        $controller = new ApiController;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $controller->postFetchUsers($request);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $responseData = json_decode($response->getContent());

        $this->assertEquals('success', $responseData->status);
        $this->assertEmpty($responseData->data->users);
    }

    #[Test]
    public function post_fetch_users_berhasil_dengan_response_tanpa_users()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getUsers')
            ->with('valid-token', 'test', 5, '')
            ->andReturn((object) [
                'data' => (object) [],  // Tidak ada property users
            ]);

        $request = Request::create('/api/fetch-users', 'POST');
        $request->headers->set('Authorization', 'Bearer valid-token');
        $request->merge(['search' => 'test']);

        $controller = new ApiController;

        // =====================================
        // Act (Aksi)
        // =====================================
        $response = $controller->postFetchUsers($request);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $responseData = json_decode($response->getContent());

        $this->assertEquals('success', $responseData->status);
        $this->assertEmpty($responseData->data->users);
    }
}
