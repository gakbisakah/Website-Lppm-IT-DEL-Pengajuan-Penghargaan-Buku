<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory; // <--- Import
use Illuminate\Database\Eloquent\Model;

class RegisSemi extends Model
{
    use HasFactory, HasUuids;

    // Gunakan tabel yang sudah ada: book_reviewers
    protected $table = 'book_reviewers';

    protected $fillable = [
        'book_submission_id',
        'user_id',
        'review_note',
        'review_date',
        'status',
    ];

    protected $casts = [
        'review_date' => 'datetime',
        'invited_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    /**
     * Set default values
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Jika status tidak diisi, set default
            if (! $model->status) {
                $model->status = 'PENDING';
            }
            // Set invited_at jika membuat undangan baru
            if (! $model->invited_at && $model->status === 'PENDING') {
                $model->invited_at = now();
            }
        });
    }
}
