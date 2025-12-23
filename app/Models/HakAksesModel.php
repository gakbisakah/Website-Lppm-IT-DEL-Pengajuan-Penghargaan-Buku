<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * @property string $id
 * @property string $user_id
 * @property string $akses
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */

class HakAksesModel extends Model
{
    protected $table = 'm_hak_akses';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'akses',
    ];

    public $timestamps = true;

    // Generate UUID otomatis jika tidak dikirim
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Mendapatkan user dengan akses Dosen lengkap dengan data dari tabel users
     * DAN sudah difilter hanya yang memiliki akses Dosen
     */
    public static function getDosenUsersWithCompleteInfo()
    {
        return DB::table('m_hak_akses as ha')
            ->join('users as u', 'u.id', '=', 'ha.user_id')
            ->where(function ($query) {
                $query->where('ha.akses', 'like', '%Dosen%')
                    ->orWhere('ha.akses', 'Dosen');
            })
            ->select(
                'u.id as user_id',
                'u.name',
                'u.email',
                'ha.akses',
                // PERBAIKAN: Gunakan single quotes untuk PostgreSQL
                DB::raw("CASE 
                    WHEN ha.akses::text LIKE '%Dosen%' THEN true 
                    ELSE false 
                END as has_dosen_akses")
            )
            ->orderBy('u.name')
            ->distinct()
            ->get();
    }

    /**
     * Mendapatkan reviewer yang tersedia untuk buku tertentu
     * dengan informasi lengkap dan status undangan
     */
    public static function getAvailableReviewersForBook($bookId)
    {
        // Ambil semua user dengan akses Dosen
        $dosenUsers = self::getDosenUsersWithCompleteInfo();

        // Ambil user yang sudah diundang
        $invitedUserIds = \App\Models\BookReviewer::where('book_submission_id', $bookId)
            ->pluck('user_id')
            ->toArray();

        // Proses data
        $availableReviewers = [];
        foreach ($dosenUsers as $user) {
            // Parse akses menjadi array
            $aksesList = array_map('trim', explode(',', $user->akses));

            $availableReviewers[] = [
                'id' => $user->user_id,
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'akses_list' => $aksesList,
                'has_dosen_akses' => in_array('Dosen', $aksesList) || str_contains($user->akses, 'Dosen'),
                'is_invited' => in_array($user->user_id, $invitedUserIds),
                'raw_akses' => $user->akses,
            ];
        }

        return $availableReviewers;
    }

    /**
     * Mendapatkan semua user_id dengan akses tertentu
     *
     * @param  string|array  $akses  Bisa string atau array akses
     */
    public static function getUserIdsByAkses($akses)
    {
        if (is_array($akses)) {
            return self::whereIn('akses', $akses)
                ->pluck('user_id')
                ->toArray();
        }

        return self::where('akses', $akses)
            ->pluck('user_id')
            ->toArray();
    }

    /**
     * Mendapatkan user_id yang memiliki akses Dosen (meskipun juga punya akses lain)
     */
    public static function getUserIdsWithDosenAkses()
    {
        return self::where(function ($query) {
            $query->where('akses', 'like', '%Dosen%')
                ->orWhere('akses', 'Dosen');
        })
            ->distinct()
            ->pluck('user_id')
            ->toArray();
    }

    /**
     * MENDAPATKAN USER LENGKAP DENGAN AKSES DOSEN
     */
    public static function getUsersWithDosenAkses()
    {
        // Ambil user_id yang memiliki akses Dosen
        $dosenUserIds = self::where(function ($query) {
            $query->where('akses', 'like', '%Dosen%')
                ->orWhere('akses', 'Dosen');
        })
            ->distinct()
            ->pluck('user_id')
            ->toArray();

        // Jika tidak ada user dengan akses Dosen
        if (empty($dosenUserIds)) {
            return collect();
        }

        return \App\Models\User::whereIn('id', $dosenUserIds)
            ->select('id as user_id', 'name', 'email')
            ->get();
    }

    /**
     * Mendapatkan semua user yang memiliki akses Dosen dengan data lengkap
     */
    public static function getDosenUsersWithDetails()
    {
        // Ambil semua user_id dengan akses Dosen
        $dosenUserIds = self::where(function ($query) {
            $query->where('akses', 'like', '%Dosen%')
                ->orWhere('akses', 'Dosen');
        })
            ->distinct()
            ->pluck('user_id')
            ->toArray();

        if (empty($dosenUserIds)) {
            return collect();
        }

        return \App\Models\User::whereIn('id', $dosenUserIds)
            ->leftJoin('m_hak_akses', 'users.id', '=', 'm_hak_akses.user_id')
            ->select(
                'users.id as user_id',
                'users.name',
                'users.email',
                'm_hak_akses.akses'
            )
            ->distinct()
            ->get();
    }

    /**
     * Mengecek apakah user memiliki akses tertentu
     */
    public static function userHasAkses($userId, $akses)
    {
        if (is_array($akses)) {
            return self::where('user_id', $userId)
                ->where(function ($query) use ($akses) {
                    foreach ($akses as $ak) {
                        $query->orWhere('akses', $ak)
                            ->orWhere('akses', 'like', "%{$ak}%");
                    }
                })
                ->exists();
        }

        return self::where('user_id', $userId)
            ->where(function ($query) use ($akses) {
                $query->where('akses', $akses)
                    ->orWhere('akses', 'like', "%{$akses}%");
            })
            ->exists();
    }

    /**
     * Mendapatkan semua akses untuk user tertentu
     */
    public static function getAksesByUserId($userId)
    {
        $aksesData = self::where('user_id', $userId)
            ->pluck('akses')
            ->toArray();

        // Jika ada string gabungan seperti "Admin,Dosen", split menjadi array
        $allAkses = [];
        foreach ($aksesData as $akses) {
            if (strpos($akses, ',') !== false) {
                // Split string gabungan
                $splitAkses = array_map('trim', explode(',', $akses));
                $allAkses = array_merge($allAkses, $splitAkses);
            } else {
                $allAkses[] = $akses;
            }
        }

        // Hapus duplikat dan kembalikan
        return array_unique($allAkses);
    }

    /**
     * Mengecek apakah user memiliki akses Dosen (termasuk dalam string gabungan)
     */
    public static function userHasDosenAkses($userId)
    {
        return self::where('user_id', $userId)
            ->where(function ($query) {
                $query->where('akses', 'Dosen')
                    ->orWhere('akses', 'like', '%Dosen%');
            })
            ->exists();
    }

    /**
     * Mendapatkan akses lengkap per record (untuk debugging)
     */
    public static function getRawAksesByUserId($userId)
    {
        return self::where('user_id', $userId)
            ->pluck('akses')
            ->toArray();
    }
}
