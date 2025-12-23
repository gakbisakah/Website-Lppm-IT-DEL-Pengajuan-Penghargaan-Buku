<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;



##Secure Query DB



/**
 * @property string $id
 * @property string $user_id
 * @property string $title
 * @property string|null $isbn
 * @property string $publisher
 * @property int $publication_year
 * @property string $publisher_level
 * @property string $book_type
 * @property int $total_pages
 * @property string|null $drive_link
 * @property string|null $pdf_path
 * @property float|null $approved_amount
 * @property \Illuminate\Support\Carbon|null $payment_date
 * @property string|null $reject_note
 * @property string|null $rejected_by
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * * @property-read \App\Models\User|null $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BookAuthor> $authors
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BookReviewer> $reviewers
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SubmissionLog> $logs
 */
class BookSubmission extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'book_submissions';

    // Konstanta Status
    public const STATUS_DRAFT = 'DRAFT';
    public const STATUS_SUBMITTED = 'SUBMITTED';
    public const STATUS_IN_REVIEW = 'IN_REVIEW';
    public const STATUS_REJECTED = 'REJECTED';
    public const STATUS_APPROVED = 'APPROVED';
    public const STATUS_PAID = 'PAID';

    protected $fillable = [
        'user_id',
        'title',
        'isbn',
        'publication_year',
        'publisher',
        'publisher_level',
        'book_type',
        'total_pages',
        'drive_link',
        'pdf_path',
        'approved_amount',
        'payment_date',
        'reject_note',
        'status',
        'rejected_by', // Tambahkan jika belum ada
    ];

    protected $casts = [
        'publication_year' => 'integer',
        'total_pages' => 'integer',
        'approved_amount' => 'decimal:2',
        'payment_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // =========================================================================
    // RELASI (RELATIONSHIPS) - INI YANG HILANG SEBELUMNYA
    // =========================================================================

    /**
     * Relasi ke Penulis (One-to-Many)
     */
    public function authors(): HasMany
    {
        return $this->hasMany(BookAuthor::class, 'book_submission_id');
    }

    /**
     * Relasi ke User Pengusul (Belongs-to)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke Reviewer (One-to-Many)
     */
    public function reviewers(): HasMany
    {
        return $this->hasMany(BookReviewer::class, 'book_submission_id');
    }

    /**
     * Relasi ke Log Aktivitas (One-to-Many)
     */
    public function logs(): HasMany
    {
        return $this->hasMany(SubmissionLog::class, 'book_submission_id');
    }
}