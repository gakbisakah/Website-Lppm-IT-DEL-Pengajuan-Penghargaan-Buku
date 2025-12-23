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
        // Jika profile BELUM ADA, buat entry baru.
        $profile = Profile::firstOrCreate(
            ['user_id' => $userId],
            [
                // Gunakan name dari Auth user saat pertama kali dibuat
                'name' => $user->name ?? 'Nama Tidak Ditemukan',
            ]
        );

        // Merge data untuk frontend
        $merged = [
            // Data dari Auth User (Sumber utama, tidak bisa diedit)
            'name' => $user->name ?? $profile->name ?? 'User Default',
            'email' => $user->email ?? 'email@kosong.com',
            'photo' => $user->photo ?? '/images/default-avatar.png',

            // Data yang bisa diedit (dari DB Profile).
            // Menggunakan nama field yang sama dengan di database (snake_case)
            // Namun, untuk kompatibilitas dengan frontend yang sudah ada,
            // kita akan menggunakan nama aslinya (NIDN, ProgramStudi, dll.)
            // yang diambil dari atribut Eloquent yang sesuai (nidn, prodi, dll.).
            // Eloquent secara otomatis akan mapping ke atribut yang benar.
            // **PENTING: Di sini kita menggunakan nama atribut Eloquent (yang sudah diperbaiki ke snake_case)**
            'NIDN' => $profile->nidn ?? '',           // DIGANTI: Dari $profile->NIDN
            'ProgramStudi' => $profile->prodi ?? '',  // DIGANTI: Dari $profile->Prodi, penamaan ProgramStudi untuk Frontend
            'SintaID' => $profile->sinta_id ?? '',    // DIGANTI: Dari $profile->SintaID
            'ScopusID' => $profile->scopus_id ?? '',  // DIGANTI: Dari $profile->ScopusID
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

        $validated = $request->validate([
            'NIDN' => 'nullable|string|max:255',
            'Prodi' => 'nullable|string|max:255',
            'SintaID' => 'nullable|string|max:255',
            'ScopusID' => 'nullable|string|max:255',
        ]);

        $profile = Profile::firstOrNew(['user_id' => $user->id]);

        $profile->nidn = $validated['NIDN'] ?? null;
        $profile->prodi = $validated['Prodi'] ?? null;
        $profile->sinta_id = $validated['SintaID'] ?? null;
        $profile->scopus_id = $validated['ScopusID'] ?? null;

        $profile->save();

        // 🚨 PERBAIKAN UTAMA: Ganti response()->json dengan redirect() atau Inertia::location()
        // Menggunakan redirect back() dengan flash message. Inertia akan me-reload props.
        return back()->with('success', 'Profil akademik berhasil diperbarui!');
    }
}