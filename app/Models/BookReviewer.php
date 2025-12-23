<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory; // <--- Import
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $book_submission_id
 * @property string $user_id
 * @property string|null $note
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property string $invited_by
 * @property \Illuminate\Support\Carbon $invited_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */

class BookReviewer extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'book_reviewers';

    protected $fillable = [
        'book_submission_id',
        'user_id',
        'note',
        'status',
        'reviewed_at',
        'invited_by',
        'invited_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'invited_at' => 'datetime',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(BookSubmission::class, 'book_submission_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'ACCEPTED');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'REJECTED');
    }
}
