<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory; // <--- Import
use Illuminate\Database\Eloquent\Model;

class SubmissionLog extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'submission_logs';

    protected $fillable = [
        'book_submission_id',
        'user_id', // ID user yang melakukan aksi (Admin/Reviewer/Dosen)
        'action',  // Misal: 'SUBMIT', 'ASSIGN_REVIEWER', 'REVIEWED', 'APPROVED'
        'note',    // Catatan tambahan (opsional)
    ];

    /**
     * Relasi ke Buku.
     */
    public function book()
    {
        return $this->belongsTo(BookSubmission::class, 'book_submission_id');
    }

    /**
     * Relasi ke User (Actor).
     * Untuk mengetahui SIAPA yang melakukan aksi ini.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
