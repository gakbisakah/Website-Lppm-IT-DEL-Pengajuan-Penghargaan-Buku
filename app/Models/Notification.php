<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; // <--- PENTING

/**
 * @property string $id
 * @property string $user_id
 * @property string $title
 * @property string $message
 * @property string $type
 * @property bool $is_read
 * @property string|null $reference_key
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */

class Notification extends Model
{
    use HasFactory, HasUuids; // <--- PENTING

    protected $table = 'notifications';

    // Guarded kosong agar bisa mass assignment semua kolom
    protected $guarded = [];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
