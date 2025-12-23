<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HakAksesModel;

class DosenController extends Controller
{
    /**
     * Mendapatkan semua user_id dosen dari tabel HakAkses
     */
    public function getDosenFromHakAkses()
    {
        try {
            // Ambil semua user_id dengan akses 'Dosen'
            $dosenData = HakAksesModel::where('akses', 'Dosen')
                ->get(['user_id', 'akses', 'created_at'])
                ->map(function ($item) {
                    return [
                        'user_id' => $item->user_id,
                        'akses' => $item->akses,
                        'nama' => "Dosen ({$item->user_id})",
                        'email' => "{$item->user_id}@dosen.local",
                        'initial' => 'D',
                        'is_invited' => false, // default
                    ];
                })
                ->toArray();

            return response()->json([
                'success' => true,
                'message' => 'Data dosen berhasil diambil',
                'data' => $dosenData,
                'count' => count($dosenData),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dosen',
                'data' => [],
                'count' => 0,
            ], 500);
        }
    }
}