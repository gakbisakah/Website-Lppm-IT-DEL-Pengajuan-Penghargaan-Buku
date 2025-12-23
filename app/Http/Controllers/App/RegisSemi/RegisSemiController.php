<?php

namespace App\Http\Controllers\App\RegisSemi;

use App\Http\Controllers\App\Notifikasi\NotificationController;
use App\Http\Controllers\Controller;
use App\Models\BookReviewer;
use App\Models\BookSubmission;
use App\Models\HakAksesModel;
use App\Models\SubmissionLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RegisSemiController extends Controller
{
    // Menampilkan daftar pengajuan masuk (Inbox LPPM)
    public function index()
    {
        $submissions = BookSubmission::with('user')
            ->where('status', '!=', 'DRAFT')
            ->orderBy('created_at', 'desc')
            ->get();

        $mappedData = $submissions->map(function ($item) {
            return [
                'id' => $item->id,
                'judul' => $item->title,
                'nama_dosen' => $item->user->name ?? 'Unknown User',
                'tanggal_pengajuan' => $item->created_at->format('d M Y'),
                'status' => $item->status,
                'status_label' => $this->formatStatusLabel($item->status),
            ];
        });

        return Inertia::render('app/RegisSemi/Index', [
            'submissions' => $mappedData,
        ]);
    }

    public function storeInvite(Request $request, $bookId)
    {
        $validated = $request->validate([
            'user_id' => 'required|uuid',
        ]);

        try {
            $book = BookSubmission::findOrFail($bookId);

            Log::info('[Store Invite] Starting invite process', [
                'book_id' => $bookId,
                'book_title' => $book->title,
                'reviewer_id' => $validated['user_id'],
                'invited_by' => Auth::id(),
            ]);

            // Cek apakah sudah diundang
            $alreadyInvited = BookReviewer::where('book_submission_id', $bookId)
                ->where('user_id', $validated['user_id'])
                ->exists();

            if ($alreadyInvited) {
                Log::warning('Reviewer already invited', [
                    'book_id' => $bookId,
                    'reviewer_id' => $validated['user_id'],
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Reviewer sudah diundang sebelumnya',
                ], 422);
            }

            // Simpan undangan ke database
            $bookReviewer = BookReviewer::create([
                'book_submission_id' => $bookId,
                'user_id' => $validated['user_id'],
                'status' => 'PENDING',
                'note' => null,
                'invited_by' => Auth::id(),
                'invited_at' => now(),
            ]);

            Log::info('[Store Invite] BookReviewer record created', [
                'book_reviewer_id' => $bookReviewer->id,
                'book_id' => $bookId,
                'reviewer_id' => $validated['user_id'],
            ]);

            // === PERBAIKAN: Pastikan user ada di tabel users ===
            $reviewerUser = User::find($validated['user_id']);

            if (! $reviewerUser) {
                Log::warning('[Store Invite] Reviewer user not found in users table, creating...', [
                    'user_id' => $validated['user_id'],
                ]);

                // Cari info user dari m_hak_akses
                $hakAkses = DB::table('m_hak_akses')
                    ->where('user_id', $validated['user_id'])
                    ->first();

                $userName = $hakAkses ? 'Reviewer' : 'Reviewer '.substr($validated['user_id'], 0, 8);
                $userEmail = $validated['user_id'].'@reviewer.local';

                // Buat user baru
                $reviewerUser = User::create([
                    'id' => $validated['user_id'],
                    'name' => $userName,
                    'email' => $userEmail,
                    'password' => bcrypt(Str::random(16)),
                ]);

                Log::info('[Store Invite] Created reviewer user', [
                    'user_id' => $reviewerUser->id,
                    'name' => $reviewerUser->name,
                ]);
            }

            // === KIRIM NOTIFIKASI ===
            Log::info('[Store Invite] Calling notification function', [
                'book_id' => $bookId,
                'book_title' => $book->title,
                'reviewer_id' => $validated['user_id'],
            ]);

            $notificationSent = NotificationController::sendReviewerInvitationNotification(
                $bookId,
                $book->title,
                $validated['user_id'] // Kirim langsung Laravel user_id
            );

            Log::info('[Store Invite] Notification result', [
                'sent' => $notificationSent,
                'book_id' => $bookId,
                'reviewer_id' => $validated['user_id'],
            ]);

            // Verifikasi notifikasi dibuat
            $notificationCheck = DB::table('notifications')
                ->where('reference_key', 'REVIEWER_INVITE_'.$bookId.'_'.$validated['user_id'])
                ->first();

            Log::info('[Store Invite] Notification verification', [
                'reference_key' => 'REVIEWER_INVITE_'.$bookId.'_'.$validated['user_id'],
                'notification_found' => $notificationCheck ? 'YES' : 'NO',
                'notification_id' => $notificationCheck->id ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Undangan berhasil dikirim',
                'debug' => [
                    'book_reviewer_id' => $bookReviewer->id,
                    'notification_created' => $notificationCheck ? true : false,
                    'notification_id' => $notificationCheck->id ?? null,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('[Store Invite] Error: '.$e->getMessage(), [
                'book_id' => $bookId,
                'reviewer_id' => $validated['user_id'] ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengundang reviewer: '.$e->getMessage(),
            ], 500);
        }
    }

    public function indexHRD()
    {
        Log::info('HRD Page accessed - Checking for APPROVED_CHIEF books');

        $submissions = BookSubmission::with('user')
            ->where('status', 'APPROVED_CHIEF')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                Log::info('Found HRD Book', [
                    'id' => $item->id,
                    'title' => $item->title,
                    'status' => $item->status,
                    'amount' => $item->approved_amount,
                ]);

                return [
                    'id' => $item->id,
                    'judul' => $item->title,
                    'nama_dosen' => $item->user->name ?? 'Unknown User',
                    'tanggal_pengajuan' => $item->created_at->format('d M Y'),
                    'status' => $item->status,
                    'status_label' => $this->formatStatusLabel($item->status),
                    'approved_amount' => $item->approved_amount,
                    'amount_formatted' => $item->approved_amount
                        ? 'Rp '.number_format($item->approved_amount, 0, ',', '.')
                        : null,
                ];
            });

        Log::info('HRD Submissions Result', [
            'count' => $submissions->count(),
            'status' => 'APPROVED_CHIEF',
        ]);

        return Inertia::render('app/home/kita-page', [
            'submissions' => $submissions,
            'debug_info' => [
                'total_records' => $submissions->count(),
                'status_filter' => 'APPROVED_CHIEF',
                'message' => 'HRD page loaded successfully',
                'timestamp' => now()->toDateTimeString(),
            ],
        ]);
    }

    public function rejectStaff(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|max:500',
        ]);

        $book = BookSubmission::findOrFail($id);

        DB::transaction(function () use ($book, $request) {
            $book->update([
                'status' => 'REJECTED',
                'reject_note' => $request->note,
            ]);

            SubmissionLog::create([
                'book_submission_id' => $book->id,
                'user_id' => Auth::id() ?? $book->user_id,
                'action' => 'REJECT',
                'note' => $request->note,
            ]);
        });

        return redirect()->route('regis-semi.indexx')
            ->with('success', 'Pengajuan dikembalikan ke Dosen (Staff).');
    }

    public function show($id)
    {
        $book = BookSubmission::with(['authors', 'user'])->findOrFail($id);

        Log::info('PDF Path Debug:', [
            'book_id' => $book->id,
            'pdf_path' => $book->pdf_path,
            'pdf_path_type' => gettype($book->pdf_path),
            'pdf_path_is_null' => is_null($book->pdf_path),
            'pdf_path_empty' => empty($book->pdf_path),
        ]);

        return Inertia::render('app/RegisSemi/Detail', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'isbn' => $book->isbn,
                'publisher' => $book->publisher,
                'drive_link' => json_decode($book->drive_link),
                'pdf_path' => $book->pdf_path,
                'status_label' => $book->status,
                'dosen' => $book->user->name ?? 'Dosen Tidak Ditemukan',
            ],
        ]);
    }

    public function previewPdf($id)
    {
        $book = BookSubmission::findOrFail($id);

        Log::info('Preview PDF', [
            'book_id' => $book->id,
            'pdf_path' => $book->pdf_path,
            'storage_path' => $book->pdf_path ? 'public/'.$book->pdf_path : null,
        ]);

        if (filter_var($book->pdf_path, FILTER_VALIDATE_URL)) {
            return redirect()->away($book->pdf_path);
        }

        if (! $book->pdf_path) {
            abort(404, 'File PDF tidak ditemukan di database.');
        }

        $storagePath = $book->pdf_path;

        if (! Storage::exists($storagePath) && Storage::exists('public/'.$storagePath)) {
            $storagePath = 'public/'.$storagePath;
        }

        if (! Storage::exists($storagePath)) {
            $possiblePaths = [
                $book->pdf_path,
                'public/'.$book->pdf_path,
                str_replace('pdfs/', 'public/pdfs/', $book->pdf_path),
                'pdfs/book-submissions/'.basename($book->pdf_path),
                'public/pdfs/book-submissions/'.basename($book->pdf_path),
            ];

            foreach ($possiblePaths as $path) {
                if (Storage::exists($path)) {
                    $storagePath = $path;
                    break;
                }
            }

            if (! Storage::exists($storagePath)) {
                Log::error('PDF not found in any location', [
                    'book_id' => $book->id,
                    'pdf_path' => $book->pdf_path,
                    'tried_paths' => $possiblePaths,
                ]);
                abort(404, 'File PDF tidak ditemukan di storage.');
            }
        }

        $fullPath = storage_path('app/'.$storagePath);

        if (! file_exists($fullPath)) {
            abort(404, 'File tidak ditemukan di server.');
        }

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.basename($fullPath).'"',
        ]);
    }

    public function downloadPdf($id)
    {
        $book = BookSubmission::findOrFail($id);

        if (! $book->pdf_path) {
            abort(404, 'File PDF tidak ditemukan.');
        }

        if (filter_var($book->pdf_path, FILTER_VALIDATE_URL)) {
            return redirect()->away($book->pdf_path);
        }

        $storagePath = 'public/'.$book->pdf_path;

        if (! Storage::exists($storagePath)) {
            abort(404, 'File tidak ditemukan di server.');
        }

        return Storage::download($storagePath, 'buku_'.$book->id.'_'.Str::slug($book->title).'.pdf');
    }

    // Tambahkan method ini ke RegisSemiController.php

    /**
     * Tampilkan hasil review dari semua reviewer untuk buku tertentu
     */
    public function showReviewResults($id)
    {
        try {
            $book = BookSubmission::with(['user'])->findOrFail($id);

            // Ambil semua review untuk buku ini
            $reviews = DB::table('book_reviewers as br')
                ->join('users as u', 'br.user_id', '=', 'u.id')
                ->where('br.book_submission_id', $id)
                ->where('br.status', 'ACCEPTED') // Hanya review yang sudah selesai
                ->whereNotNull('br.note') // Hanya yang ada catatannya
                ->select(
                    'br.id',
                    'br.note',
                    'br.reviewed_at',
                    'u.id as reviewer_id',
                    'u.name as reviewer_name',
                    'u.email as reviewer_email'
                )
                ->orderBy('br.reviewed_at', 'desc')
                ->get();

            Log::info('[Review Results] Loaded reviews', [
                'book_id' => $id,
                'review_count' => $reviews->count(),
                'book_title' => $book->title,
            ]);

            // Format data untuk frontend
            $results = $reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'reviewer_name' => $review->reviewer_name,
                    'reviewer_email' => $review->reviewer_email,
                    'comment' => $review->note,
                    'reviewed_at' => $review->reviewed_at,
                    'formatted_date' => Carbon::parse($review->reviewed_at)->format('d M Y, H:i'),
                ];
            })->toArray();

            return Inertia::render('App/RegisSemi/Result', [
                'bukuId' => $book->id,
                'bookTitle' => $book->title,
                'bookIsbn' => $book->isbn,
                'bookAuthor' => $book->user->name ?? 'Unknown',
                'results' => $results,
                'reviewCount' => count($results),
            ]);

        } catch (\Exception $e) {
            Log::error('[Review Results] Error loading reviews', [
                'book_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('regis-semi.index')
                ->with('error', 'Gagal memuat hasil review');
        }
    }

    public function showStaff($id)
    {
        $book = BookSubmission::with(['authors', 'user'])->findOrFail($id);

        Log::info('PDF Path Debug Staff:', [
            'book_id' => $book->id,
            'pdf_path' => $book->pdf_path,
            'pdf_path_type' => gettype($book->pdf_path),
            'pdf_path_is_null' => is_null($book->pdf_path),
            'pdf_path_empty' => empty($book->pdf_path),
        ]);

        return Inertia::render('app/RegisSemi/Staff', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'isbn' => $book->isbn,
                'publisher' => $book->publisher,
                'drive_link' => json_decode($book->drive_link),
                'pdf_path' => $book->pdf_path,
                'status_label' => $book->status,
                'dosen' => $book->user->name ?? 'Dosen Tidak Ditemukan',
            ],
        ]);
    }

    public function invite($id)
    {
        $book = BookSubmission::findOrFail($id);

        // Gunakan method baru yang sudah memperbaiki join dengan tabel users
        $availableReviewers = HakAksesModel::getAvailableReviewersForBook($id);

        Log::info('Available Reviewers with User Info', [
            'book_id' => $id,
            'total_reviewers' => count($availableReviewers),
            'reviewers_sample' => array_slice($availableReviewers, 0, 3),
            'with_dosen_count' => count(array_filter($availableReviewers, fn ($r) => $r['has_dosen_akses'])),
        ]);

        // Urutkan: yang punya akses Dosen duluan
        usort($availableReviewers, function ($a, $b) {
            if ($a['has_dosen_akses'] && ! $b['has_dosen_akses']) {
                return -1;
            }
            if (! $a['has_dosen_akses'] && $b['has_dosen_akses']) {
                return 1;
            }

            // Jika sama, urutkan berdasarkan nama
            return strcmp($a['name'], $b['name']);
        });

        return Inertia::render('App/RegisSemi/Invite', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'isbn' => $book->isbn,
                'status' => $book->status,
            ],
            'availableReviewers' => $availableReviewers,
            'stats' => [
                'total_reviewers' => count($availableReviewers),
                'with_dosen_akses' => count(array_filter($availableReviewers, fn ($r) => $r['has_dosen_akses'])),
                'invited_count' => count(array_filter($availableReviewers, fn ($r) => $r['is_invited'])),
            ],
        ]);
    }

    private function checkIfAlreadyInvited($userId, $bookId)
    {
        return BookReviewer::where('book_submission_id', $bookId)
            ->where('user_id', $userId)
            ->exists();
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        $book = BookSubmission::findOrFail($id);

        DB::transaction(function () use ($book, $request) {
            $book->update([
                'status' => 'APPROVED_CHIEF',
                'approved_amount' => $request->amount,
            ]);

            $userId = Auth::id() ?? $book->user_id;

            SubmissionLog::create([
                'book_submission_id' => $book->id,
                'user_id' => $userId,
                'action' => 'APPROVE',
                'note' => 'Pengajuan disetujui oleh Ketua LPPM. Menunggu pencairan HRD.',
            ]);

            NotificationController::sendBookPaymentNotification(
                $book->id,
                $book->title,
                $book->approved_amount
            );
        });

        Log::info('Book approved for HRD', [
            'book_id' => $book->id,
            'title' => $book->title,
            'amount' => $book->approved_amount,
            'status' => $book->status,
        ]);

        return redirect()->route('regis-semi.index')
            ->with('success', 'Pengajuan berhasil disetujui dan diteruskan ke HRD.');
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|max:500',
        ]);

        $book = BookSubmission::findOrFail($id);

        DB::transaction(function () use ($book, $request) {
            $book->update([
                'status' => 'REJECTED',
                'reject_note' => $request->note,
            ]);

            SubmissionLog::create([
                'book_submission_id' => $book->id,
                'user_id' => Auth::id() ?? $book->user_id,
                'action' => 'REJECT',
                'note' => $request->note,
            ]);
        });

        return redirect()->route('regis-semi.index')
            ->with('success', 'Pengajuan dikembalikan ke Dosen.');
    }

    private function formatStatusLabel($status)
    {
        return match ($status) {
            'DRAFT' => 'Draft',
            'SUBMITTED' => 'Menunggu Verifikasi',
            'REVISION_REQUIRED' => 'Perlu Revisi',
            'VERIFIED_STAFF' => 'Review Ketua',
            'APPROVED_CHIEF' => 'Disetujui LPPM',
            'REJECTED' => 'Ditolak/Revisi',
            'PAID' => 'Selesai (Cair)',
            default => $status,
        };
    }

    public function indexBukuMasuk()
    {
        $submissions = BookSubmission::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'judul' => $item->title,
                    'nama_dosen' => $item->user->name ?? '-',
                    'status_label' => $this->formatStatus($item->status),
                    'tanggal_pengajuan' => $item->created_at->format('d M Y, H:i'),
                ];
            });

        return inertia('App/RegisSemi/Indexx', [
            'submissions' => $submissions,
            'pageName' => 'Penghargaan Buku Masuk',
        ]);
    }

    private function formatStatus($status)
    {
        $statusMap = [
            'Draft' => 'Draft',
            'Submitted' => 'Menunggu Verifikasi',
            'Approved' => 'Disetujui (Ke HRD)',
            'Rejected' => 'Ditolak/Revisi',
            'Paid' => 'Selesai (Cair)',
        ];

        return $statusMap[$status] ?? $status;
    }

    public function result()
    {
        $submissions = BookSubmission::with('user')
            ->where('status', 'PAID')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'judul' => $item->title,
                    'nama_dosen' => $item->user->name ?? '-',
                    'status_label' => $this->formatStatus($item->status),
                    'tanggal_pengajuan' => $item->created_at->format('d M Y, H:i'),
                ];
            });

        return Inertia::render('App/RegisSemi/Result', [
            'submissions' => $submissions,
            'pageName' => 'Hasil Pengajuan Buku',
        ]);
    }
}