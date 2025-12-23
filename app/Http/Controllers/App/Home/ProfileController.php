<?php

namespace App\Http\Controllers\App\Profile;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Menampilkan data profil user (gabungan Auth + DB)
     */
    public function index()
    {
        $user = Auth::user();
        $userId = $user->id;

        // Ambil data dari database (profile).
        $profile = Profile::firstOrCreate(
            ['user_id' => $userId],
            [
                'name' => $user->name ?? 'Nama Tidak Ditemukan',
            ]
        );

        // Merge data untuk frontend
        $merged = [
            // Data dari Auth User
            'name' => $user->name ?? $profile->name ?? 'User Default',
            'email' => $user->email ?? 'email@kosong.com',
            'photo' => $user->photo ?? '/images/default-avatar.png',

            // Data yang bisa diedit dari DB (menggunakan nama field snake_case)
            'NIDN' => $profile->nidn ?? '',
            'ProgramStudi' => $profile->prodi ?? '',
            'SintaID' => $profile->sinta_id ?? '',
            'ScopusID' => $profile->scopus_id ?? '',
        ];

        Log::info('Profile Data Merged:', $merged);

        return inertia('Profile/Index', [
            'user' => $merged,
        ]);
    }

    /**
     * Update data profil user (hanya field editable)
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Validasi data yang masuk
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'NIDN' => 'nullable|string|max:255',
            'Prodi' => 'nullable|string|max:255',
            'SintaID' => 'nullable|string|max:255',
            'ScopusID' => 'nullable|string|max:255',
        ]);

        Log::info('Update Profile - User ID:', ['user_id' => $user->id]);
        Log::info('Update Profile - Validated Data:', $validated);

        // Ambil atau buat profile
        $profile = Profile::firstOrNew(['user_id' => $user->id]);

        // Update semua field yang tervalidasi
        $profile->name = $validated['name'] ?? $profile->name;
        $profile->nidn = $validated['NIDN'] ?? null;
        $profile->prodi = $validated['Prodi'] ?? null;
        $profile->sinta_id = $validated['SintaID'] ?? null;
        $profile->scopus_id = $validated['ScopusID'] ?? null;

        $saved = $profile->save();

        Log::info('Profile Save Result:', [
            'success' => $saved,
            'profile_data' => $profile->toArray(),
        ]);

        if ($saved) {
            return back()->with('success', 'Profil akademik berhasil diperbarui!');
        }

        return back()->with('error', 'Gagal menyimpan profil. Silakan coba lagi.');
    }
}