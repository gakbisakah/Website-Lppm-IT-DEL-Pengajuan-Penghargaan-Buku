<?php

namespace Tests\Unit\Middleware;

use App\Helper\ToolsHelper;
use App\Http\Api\UserApi;
use App\Http\Middleware\CheckAuthMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CheckAuthMiddlewareTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Gunakan database in-memory untuk test
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        
        // Setup schema
        Schema::create('users', function ($table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('username')->nullable();
            $table->timestamps();
        });
        
        Schema::create('profiles', function ($table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('name');
            $table->string('nidn')->nullable();
            $table->string('prodi')->nullable();
            $table->string('sinta_id')->nullable();
            $table->string('scopus_id')->nullable();
            $table->timestamps();
        });
        
        Schema::create('user_id_mappings', function ($table) {
            $table->id();
            $table->string('api_user_id');
            $table->string('laravel_user_id');
            $table->timestamps();
        });
        
        Schema::create('hak_akses', function ($table) {
            $table->uuid('id')->primary();
            $table->string('user_id');
            $table->text('akses');
            $table->timestamps();
        });
        
        Mockery::close();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('user_id_mappings');
        Schema::dropIfExists('hak_akses');
        
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function redirect_ke_login_jika_token_tidak_ada()
    {
        ToolsHelper::setAuthToken('');

        $request = Request::create('/app/profile', 'GET');
        $middleware = new CheckAuthMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Should not reach here');
        });

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue($response->isRedirect(route('auth.login')));
    }

    #[Test]
    public function redirect_ke_login_jika_token_invalid()
    {
        ToolsHelper::setAuthToken('invalid-token');

        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getMe')
            ->with('invalid-token')
            ->andReturn((object) [
                'data' => (object) [],
            ]);

        $request = Request::create('/app/profile', 'GET');
        $middleware = new CheckAuthMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Should not reach here');
        });

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue($response->isRedirect(route('auth.login')));
    }

    #[Test]
    public function melanjutkan_request_dengan_auth_data_jika_token_valid()
    {
        $userId = '8357fda6-67f7-4a99-8f01-9847d6920599';
        
        // Buat user di database
        DB::table('users')->insert([
            'id' => $userId,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'username' => 'testuser',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $userData = (object) [
            'id' => $userId,
            'name' => 'Test User',
            'email' => 'test@example.com',
        ];

        ToolsHelper::setAuthToken('valid-token');

        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getMe')
            ->with('valid-token')
            ->andReturn((object) [
                'data' => (object) [
                    'user' => $userData,
                ],
            ]);

        // Mock HakAksesModel yang digunakan di middleware
        $hakAksesModelMock = Mockery::mock('alias:App\Models\HakAksesModel');
        $hakAksesInstance = (object) [
            'akses' => 'view,edit'
        ];
        
        $hakAksesModelMock->shouldReceive('where')
            ->with('user_id', $userId)
            ->andReturnSelf();
        
        $hakAksesModelMock->shouldReceive('first')
            ->andReturn($hakAksesInstance);

        $request = Request::create('/app/profile', 'GET');
        $middleware = new CheckAuthMiddleware;

        $testPassed = false;
        $response = $middleware->handle($request, function ($req) use (&$testPassed) {
            $auth = $req->attributes->get('auth');
            
            $this->assertIsObject($auth);
            $this->assertIsArray($auth->akses);
            $this->assertCount(2, $auth->akses);
            $this->assertContains('view', $auth->akses);
            $this->assertContains('edit', $auth->akses);
            
            $testPassed = true;
            return response('Success', 200);
        });

        $this->assertTrue($testPassed, 'Closure was not executed');
        $this->assertEquals(200, $response->getStatusCode());
    }

    #[Test]
    public function melanjutkan_request_dengan_akses_kosong_jika_tidak_ada_hak_akses()
    {
        $userId = '8357fda6-67f7-4a99-8f01-9847d6920599';
        
        // Buat user di database
        DB::table('users')->insert([
            'id' => $userId,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'username' => 'testuser',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $userData = (object) [
            'id' => $userId,
            'name' => 'Test User',
            'email' => 'test@example.com',
        ];

        ToolsHelper::setAuthToken('valid-token');

        $userApiMock = Mockery::mock('alias:'.UserApi::class);
        $userApiMock
            ->shouldReceive('getMe')
            ->with('valid-token')
            ->andReturn((object) [
                'data' => (object) [
                    'user' => $userData,
                ],
            ]);

        // Mock HakAksesModel untuk return null
        $hakAksesModelMock = Mockery::mock('alias:App\Models\HakAksesModel');
        $hakAksesModelMock->shouldReceive('where')
            ->with('user_id', $userId)
            ->andReturnSelf();
        
        $hakAksesModelMock->shouldReceive('first')
            ->andReturn(null);

        $request = Request::create('/app/profile', 'GET');
        $middleware = new CheckAuthMiddleware;

        $testPassed = false;
        $response = $middleware->handle($request, function ($req) use (&$testPassed) {
            $auth = $req->attributes->get('auth');
            
            $this->assertIsObject($auth);
            $this->assertIsArray($auth->akses);
            $this->assertEmpty($auth->akses);
            
            $testPassed = true;
            return response('Success', 200);
        });

        $this->assertTrue($testPassed, 'Closure was not executed');
        $this->assertEquals(200, $response->getStatusCode());
    }
}