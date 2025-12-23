<?php

namespace App\Http\Middleware;

use App\Helper\ToolsHelper;
use App\Http\Api\UserApi;
use App\Models\HakAksesModel;
use App\Models\Profile;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CheckAuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $authToken = ToolsHelper::getAuthToken();

        if (empty($authToken)) {
            return redirect()->route('auth.login');
        }

        $response = UserApi::getMe($authToken);

        if (! isset($response->data->user)) {
            Log::warning('API User data not found in response', [
                'response_keys' => array_keys((array) $response->data ?? []),
            ]);

            return redirect()->route('auth.login');
        }

        $apiUser = $response->data->user;

        Log::info('API User Data Received', [
            'api_user_id' => $apiUser->id,
            'email' => $apiUser->email ?? 'N/A',
            'name' => $apiUser->name ?? 'N/A',
            'username' => $apiUser->username ?? 'N/A',
        ]);

        // === STRATEGI PENCARIAN & PENYELARASAN USER ===
        $laravelUser = null;
        $needToCreateMapping = true;

        // 1. Cari berdasarkan EMAIL (paling akurat)
        if (isset($apiUser->email) && ! empty($apiUser->email)) {
            $laravelUser = User::where('email', $apiUser->email)->first();

            if ($laravelUser) {
                Log::info('Found user by email', [
                    'email' => $apiUser->email,
                    'user_id' => $laravelUser->id,
                ]);

                // Jika ID berbeda, perlu mapping
                if ($laravelUser->id !== $apiUser->id) {
                    Log::warning('ID mismatch between API and Laravel', [
                        'api_id' => $apiUser->id,
                        'laravel_id' => $laravelUser->id,
                        'email' => $apiUser->email,
                    ]);

                    // Buat mapping antara API ID dan Laravel ID
                    $this->createIdMapping($apiUser->id, $laravelUser->id);
                } else {
                    // ID sama, mapping tetap dibuat untuk konsistensi
                    $this->createIdMapping($apiUser->id, $laravelUser->id);
                }
                $needToCreateMapping = false;
            }
        }

        // 2. Jika tidak ditemukan dengan email, cari dengan ID API
        if (! $laravelUser && isset($apiUser->id)) {
            $laravelUser = User::where('id', $apiUser->id)->first();

            if ($laravelUser) {
                Log::info('Found user by API ID', [
                    'api_id' => $apiUser->id,
                    'user_id' => $laravelUser->id,
                ]);

                // Mapping dengan diri sendiri
                $this->createIdMapping($apiUser->id, $laravelUser->id);
                $needToCreateMapping = false;
            }
        }

        // 3. Cari di mapping table berdasarkan API ID
        if (! $laravelUser && isset($apiUser->id)) {
            $mapping = DB::table('user_id_mappings')
                ->where('api_user_id', $apiUser->id)
                ->first();

            if ($mapping) {
                $laravelUser = User::where('id', $mapping->laravel_user_id)->first();

                if ($laravelUser) {
                    Log::info('Found user via mapping table', [
                        'api_id' => $apiUser->id,
                        'laravel_id' => $laravelUser->id,
                        'mapping_id' => $mapping->id,
                    ]);
                    $needToCreateMapping = false;
                }
            }
        }

        // 4. Jika user TIDAK DITEMUKAN sama sekali, BUAT BARU
        if (! $laravelUser) {
            $email = $apiUser->email ?? ($apiUser->id.'@'.env('APP_DOMAIN', 'example.com'));
            $name = $apiUser->name ?? ('User_'.substr($apiUser->id, 0, 8));

            try {
                $laravelUser = User::create([
                    'id' => $apiUser->id, // Gunakan API ID sebagai Laravel ID
                    'name' => $name,
                    'email' => $email,
                    'username' => $apiUser->username ?? Str::slug($name),
                    'password' => bcrypt(Str::random(32)), // Password random yang aman
                ]);

                Log::info('Created NEW Laravel user', [
                    'api_user_id' => $apiUser->id,
                    'laravel_user_id' => $laravelUser->id,
                    'email' => $laravelUser->email,
                    'name' => $laravelUser->name,
                ]);

                // Buat mapping (ID sama, tapi tetap dibuat untuk konsistensi)
                $this->createIdMapping($apiUser->id, $laravelUser->id);
                $needToCreateMapping = false;

            } catch (\Exception $e) {
                Log::error('Failed to create Laravel user', [
                    'api_id' => $apiUser->id,
                    'error' => $e->getMessage(),
                ]);

                // Fallback: coba dengan ID yang berbeda
                try {
                    $laravelUser = User::create([
                        'id' => Str::uuid(), // Generate UUID baru
                        'name' => $name,
                        'email' => $email,
                        'username' => $apiUser->username ?? Str::slug($name),
                        'password' => bcrypt(Str::random(32)),
                    ]);

                    Log::info('Created Laravel user with new UUID', [
                        'api_user_id' => $apiUser->id,
                        'laravel_user_id' => $laravelUser->id,
                    ]);

                    // Buat mapping karena ID berbeda
                    $this->createIdMapping($apiUser->id, $laravelUser->id);
                    $needToCreateMapping = false;

                } catch (\Exception $e2) {
                    Log::error('Failed to create user with new UUID', [
                        'api_id' => $apiUser->id,
                        'error' => $e2->getMessage(),
                    ]);

                    // Akhirnya cari user default atau buat dengan email unik
                    $laravelUser = User::firstOrCreate(
                        ['email' => 'fallback_'.$apiUser->id.'@'.env('APP_DOMAIN', 'example.com')],
                        [
                            'id' => Str::uuid(),
                            'name' => $name,
                            'password' => bcrypt(Str::random(32)),
                        ]
                    );

                    $this->createIdMapping($apiUser->id, $laravelUser->id);
                    $needToCreateMapping = false;
                }
            }
        }

        // 5. PASTIKAN mapping dibuat jika belum
        if ($needToCreateMapping && isset($apiUser->id) && $laravelUser) {
            $this->createIdMapping($apiUser->id, $laravelUser->id);
        }

        // 6. Pastikan profile ada
        try {
            Profile::firstOrCreate(
                ['user_id' => $laravelUser->id],
                [
                    'name' => $laravelUser->name,
                    'nidn' => null,
                    'prodi' => null,
                    'sinta_id' => null,
                    'scopus_id' => null,
                ]
            );
        } catch (\Exception $e) {
            Log::warning('Failed to create/update profile', [
                'user_id' => $laravelUser->id,
                'error' => $e->getMessage(),
            ]);
        }

        // 7. Login Laravel
        try {
            if (! Auth::check() || Auth::id() !== $laravelUser->id) {
                Auth::login($laravelUser);
                Log::info('User logged in successfully', [
                    'user_id' => $laravelUser->id,
                    'name' => $laravelUser->name,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to login user', [
                'user_id' => $laravelUser->id,
                'error' => $e->getMessage(),
            ]);
        }

        // 8. Ambil hak akses menggunakan API user_id
        $apiUserAkses = [];
        try {
            $akses = HakAksesModel::where('user_id', $apiUser->id)->first();
            if ($akses) {
                $apiUserAkses = array_map('trim', explode(',', $akses->akses));
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get hak akses', [
                'api_user_id' => $apiUser->id,
                'error' => $e->getMessage(),
            ]);
        }

        // 9. Simpan Laravel user_id ke apiUser untuk referensi
        $apiUser->laravel_user_id = $laravelUser->id;
        $apiUser->akses = $apiUserAkses; // Update akses ke object

        // 10. Simpan juga di session untuk akses mudah
        session(['laravel_user_id' => $laravelUser->id]);
        session(['api_user_id' => $apiUser->id]);

        Log::info('User authentication completed', [
            'api_user_id' => $apiUser->id,
            'laravel_user_id' => $laravelUser->id,
            'email' => $laravelUser->email,
            'akses_count' => count($apiUserAkses),
        ]);

        // 11. Set auth data ke request (sebagai object)
        $request->attributes->set('auth', $apiUser);

        // 12. PERBAIKAN: JANGAN gunakan merge() dengan object stdClass
        // Gunakan array_merge pada input yang sudah ada, bukan merge object
        // Hapus baris ini karena menyebabkan error:
        // $request->merge([
        //     'laravel_user' => $laravelUser,
        //     'api_user' => $apiUser
        // ]);

        // Sebagai gantinya, kita bisa set data dalam attributes atau session
        $request->attributes->set('laravel_user', $laravelUser);

        // Atau jika perlu di input, convert ke array terlebih dahulu
        $apiUserArray = json_decode(json_encode($apiUser), true); // Convert stdClass to array
        $request->merge([
            'laravel_user_id' => $laravelUser->id,
            'api_user_id' => $apiUser->id,
            'api_user_email' => $apiUser->email ?? null,
            'api_user_name' => $apiUser->name ?? null,
        ]);

        return $next($request);
    }

    /**
     * Buat mapping antara API ID dan Laravel ID dengan error handling
     */
    private function createIdMapping($apiUserId, $laravelUserId)
    {
        try {
            // Pastikan tabel exist
            if (! Schema::hasTable('user_id_mappings')) {
                Log::warning('user_id_mappings table does not exist');

                return false;
            }

            $exists = DB::table('user_id_mappings')
                ->where('api_user_id', $apiUserId)
                ->exists();

            if ($exists) {
                // Update existing mapping
                DB::table('user_id_mappings')
                    ->where('api_user_id', $apiUserId)
                    ->update([
                        'laravel_user_id' => $laravelUserId,
                        'updated_at' => now(),
                    ]);

                Log::info('Updated existing ID mapping', [
                    'api_user_id' => $apiUserId,
                    'laravel_user_id' => $laravelUserId,
                ]);
            } else {
                // Create new mapping
                DB::table('user_id_mappings')->insert([
                    'api_user_id' => $apiUserId,
                    'laravel_user_id' => $laravelUserId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                Log::info('Created new ID mapping', [
                    'api_user_id' => $apiUserId,
                    'laravel_user_id' => $laravelUserId,
                ]);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to create/update ID mapping', [
                'api_user_id' => $apiUserId,
                'laravel_user_id' => $laravelUserId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Coba alternatif: simpan di cache atau session
            try {
                cache()->put('user_mapping_'.$apiUserId, $laravelUserId, now()->addHours(24));
                Log::info('Saved mapping to cache as fallback', [
                    'api_user_id' => $apiUserId,
                    'laravel_user_id' => $laravelUserId,
                ]);
            } catch (\Exception $cacheError) {
                Log::error('Failed to save mapping to cache', [
                    'error' => $cacheError->getMessage(),
                ]);
            }

            return false;
        }
    }

    /**
     * Migrasi data dari user lama ke user baru
     */
    private function migrateUserData($oldUserId, $newUserId)
    {
        try {
            // Hanya migrasi jika berbeda
            if ($oldUserId === $newUserId) {
                return;
            }

            $tables = [
                'profiles',
                'book_submissions',
                'notifications',
                'submission_logs',
                'book_reviewers',
            ];

            foreach ($tables as $table) {
                if (Schema::hasTable($table)) {
                    $count = DB::table($table)
                        ->where('user_id', $oldUserId)
                        ->count();

                    if ($count > 0) {
                        DB::table($table)
                            ->where('user_id', $oldUserId)
                            ->update(['user_id' => $newUserId]);

                        Log::info('Migrated user data', [
                            'table' => $table,
                            'old_user_id' => $oldUserId,
                            'new_user_id' => $newUserId,
                            'records_migrated' => $count,
                        ]);
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('Migration error', [
                'error' => $e->getMessage(),
                'old_user_id' => $oldUserId,
                'new_user_id' => $newUserId,
            ]);
        }
    }
}