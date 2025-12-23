<?php

namespace App\Http\Controllers\App\Notifikasi;

use App\Http\Controllers\Controller;
use App\Models\Notification; // Pastikan Model ini sudah dibuat
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Penting untuk Generate UUID manual
use Illuminate\Support\Str;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Tampilkan halaman notifikasi dan buat notifikasi yang diperlukan.
     */
    public function index(Request $request)
    {
        $authUser = $request->attributes->get('auth');

        // Ambil user Laravel berdasarkan email/ID dari API Auth
        $laravelUser = User::where('email', $authUser->email ?? null)->first();
        // Fallback jika email tidak ada, coba cari berdasarkan ID (UUID friendly)
        if (! $laravelUser && isset($authUser->id)) {
            $laravelUser = User::find($authUser->id);
        }

        $notifications = [];
        $filters = [
            'search' => $request->input('search', ''),
            'filter' => $request->input('filter', 'semua'),
            'sort' => $request->input('sort', 'terbaru'),
        ];

        if (! $laravelUser) {
            Log::error('Laravel User not found for notification page access', ['api_auth' => $authUser]);

            return Inertia::render('app/notifikasi/page', [
                'notifications' => [],
                'filters' => $filters,
                'booksForReview' => [],
            ]);
        }

        // Ambil hak akses user
        $hakAkses = DB::table('m_hak_akses')
            ->where('user_id', $laravelUser->id) // Gunakan ID Laravel yg sudah pasti UUID
            ->first();

        // Fallback cek pakai API ID jika di m_hak_akses masih pakai ID lama
        if (! $hakAkses && isset($authUser->id)) {
            $hakAkses = DB::table('m_hak_akses')->where('user_id', $authUser->id)->first();
        }

        $userAccess = [];
        if ($hakAkses) {
            $userAccess = array_map('trim', explode(',', $hakAkses->akses));
        }

        $isLPPM = ! empty(array_intersect(['Lppm Staff', 'Lppm Ketua'], $userAccess));
        $isDosen = ! empty(array_intersect(['Dosen'], $userAccess));
        $userAccessLower = array_map('strtolower', $userAccess);
        $isHRD = in_array('hrd', $userAccessLower);

        Log::info('User access check', [
            'user_id' => $laravelUser->id,
            'is_lppm' => $isLPPM,
            'is_dosen' => $isDosen,
            'is_hrd' => $isHRD,
        ]);

        // --- Proses Pembuatan Notifikasi (Pemicu) ---
        $this->createWelcomeNotification($laravelUser->id);

        if ($isLPPM) {
            $this->createBookSubmissionNotifications($laravelUser->id);
            $this->createBookRevisionNotifications($laravelUser->id);
        }

        if ($isDosen) {
            $this->createBookRejectionNotifications($laravelUser->id);
            $this->createPaymentSuccessNotifications($laravelUser->id);
        }

        if ($isHRD) {
            $this->createBookPaymentNotifications($laravelUser->id);
        }

        // --- Query Data Notifikasi ---
        $query = Notification::where('user_id', $laravelUser->id)
            ->where(function ($q) use ($isLPPM, $isDosen, $isHRD) {
                $q->whereNull('reference_key')
                    ->orWhere('type', 'System');

                if ($isDosen) {
                    $q->orWhere('reference_key', 'like', 'REJECT_%')
                        ->orWhere('reference_key', 'like', 'PAYMENT_SUCCESS_%')
                        ->orWhere('reference_key', 'like', 'REVIEWER_INVITE_%');
                }

                if ($isLPPM) {
                    $q->orWhere('reference_key', 'like', 'SUBMISSION_%')
                        ->orWhere('reference_key', 'like', 'REVISION_%')
                        ->orWhere('reference_key', 'like', 'REVIEW_COMPLETE_%');
                }

                if ($isHRD) {
                    $q->orWhere('reference_key', 'like', 'PAYMENT_CHIEF_%');
                }
            });

        // Apply search
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}%")
                    ->orWhere('message', 'like', "%{$filters['search']}%");
            });
        }

        // Apply filter
        if ($filters['filter'] === 'belum_dibaca') {
            $query->where('is_read', false);
        } elseif ($filters['filter'] !== 'semua') {
            $query->where('type', $filters['filter']);
        }

        // Apply sort
        if ($filters['sort'] === 'terbaru') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('created_at', 'asc');
        }

        // Get notifications
        $notifications = $query->get()->map(function ($notif) {
            return [
                'id' => $notif->id, // ✅ PERBAIKAN: Hapus (int) casting agar UUID string aman
                'user_id' => $notif->user_id,
                'title' => $notif->title,
                'message' => $notif->message,
                'type' => $notif->type,
                'is_read' => (bool) $notif->is_read,
                'created_at' => $notif->created_at,
                'updated_at' => $notif->updated_at,
                'reference_key' => $notif->reference_key,
            ];
        })->toArray();

        // === Ambil detail buku untuk notifikasi reviewer ===
        $booksForReview = [];

        $reviewInviteNotifs = array_filter($notifications, function ($notif) {
            return strpos($notif['reference_key'] ?? '', 'REVIEWER_INVITE_') === 0;
        });

        foreach ($reviewInviteNotifs as $notif) {
            $parts = explode('_', $notif['reference_key']);
            // Format: REVIEWER_INVITE_{BOOK_ID}_{USER_ID}
            if (count($parts) >= 3) {
                $bookId = $parts[2];

                $bookDetail = DB::table('book_submissions as bs')
                    ->leftJoin('users as u', 'bs.user_id', '=', 'u.id')
                    ->where('bs.id', $bookId)
                    ->select('bs.id', 'bs.title', 'bs.isbn', 'bs.publisher', 'bs.drive_link', 'bs.created_at', 'u.name as user_name')
                    ->first();

                if ($bookDetail) {
                    $booksForReview[$notif['id']] = [
                        'id' => $bookDetail->id, // ✅ PERBAIKAN: Hapus (int) casting
                        'title' => $bookDetail->title,
                        'isbn' => $bookDetail->isbn,
                        'publisher' => $bookDetail->publisher,
                        'drive_link' => $bookDetail->drive_link,
                        'user_name' => $bookDetail->user_name,
                        'created_at' => $bookDetail->created_at,
                    ];
                }
            }
        }

        return Inertia::render('app/notifikasi/page', [
            'notifications' => $notifications,
            'filters' => $filters,
            'booksForReview' => $booksForReview,
        ]);
    }

    // --- Helper Methods ---

    private function createWelcomeNotification($laravelUserId)
    {
        $exists = Notification::where('user_id', $laravelUserId)
            ->where('title', 'Selamat Datang di Website LPPM')
            ->exists();

        if ($exists) {
            return;
        }

        $profile = DB::table('profiles')->where('user_id', $laravelUserId)->first();

        $isProfileComplete = $profile && ! empty($profile->nidn)
            && ! empty($profile->prodi)
            && ! empty($profile->sinta_id)
            && ! empty($profile->scopus_id);

        $title = 'Selamat Datang di Website LPPM';
        $message = $isProfileComplete
            ? 'Selamat datang di Website LPPM. Anda siap untuk mengajukan buku.'
            : 'Selamat datang, Silahkan Melengkapi Profilmu untuk pengalaman yang lebih baik.';

        // ✅ PERBAIKAN: Gunakan Model::create agar UUID otomatis dibuat
        Notification::create([
            'user_id' => $laravelUserId,
            'title' => $title,
            'message' => $message,
            'type' => 'System',
            'is_read' => false,
        ]);
    }

    private function createBookSubmissionNotifications($laravelUserId)
    {
        try {
            $submittedBooks = DB::table('book_submissions')
                ->select('id', 'title', 'user_id')
                ->where('status', 'SUBMITTED')
                ->whereNull('reject_note')
                ->get();

            if ($submittedBooks->isEmpty()) {
                return;
            }

            $submitterIds = $submittedBooks->pluck('user_id')->unique()->toArray();
            $dosenUsers = User::whereIn('id', $submitterIds)->pluck('name', 'id');

            foreach ($submittedBooks as $book) {
                $dosenName = $dosenUsers[$book->user_id] ?? 'Dosen';
                $messageFormat = "{$dosenName} mengirim buku '{$book->title}'. Segera verifikasi.";
                $referenceKey = 'SUBMISSION_'.$book->id;

                $notifExists = Notification::where('user_id', $laravelUserId)
                    ->where('reference_key', $referenceKey)
                    ->exists();

                if (! $notifExists) {
                    // ✅ PERBAIKAN: Gunakan Model::create
                    Notification::create([
                        'user_id' => $laravelUserId,
                        'title' => 'Pengajuan Buku Baru',
                        'message' => $messageFormat,
                        'type' => 'Info',
                        'is_read' => false,
                        'reference_key' => $referenceKey,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error creating book submission notifications', ['error' => $e->getMessage()]);
        }
    }

    private function createBookRevisionNotifications($laravelUserId)
    {
        try {
            $revisionBooks = DB::table('book_submissions')
                ->select('id', 'title', 'user_id')
                ->where('status', 'SUBMITTED')
                ->whereNotNull('reject_note')
                ->get();

            if ($revisionBooks->isEmpty()) {
                return;
            }

            $submitterIds = $revisionBooks->pluck('user_id')->unique()->toArray();
            $dosenUsers = User::whereIn('id', $submitterIds)->pluck('name', 'id');

            foreach ($revisionBooks as $book) {
                $dosenName = $dosenUsers[$book->user_id] ?? 'Dosen';
                $messageFormat = "Revisi buku '{$book->title}' dari {$dosenName} perlu ditindaklanjuti.";
                $referenceKey = 'REVISION_'.$book->id;

                $notifExists = Notification::where('user_id', $laravelUserId)
                    ->where('reference_key', $referenceKey)
                    ->exists();

                if (! $notifExists) {
                    // ✅ PERBAIKAN: Gunakan Model::create
                    Notification::create([
                        'user_id' => $laravelUserId,
                        'title' => 'Revisi Pengajuan Buku',
                        'message' => $messageFormat,
                        'type' => 'Peringatan',
                        'is_read' => false,
                        'reference_key' => $referenceKey,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error creating book revision notifications', ['error' => $e->getMessage()]);
        }
    }

    private function createBookRejectionNotifications($laravelUserId)
    {
        try {
            $rejectedBooks = DB::table('book_submissions')
                ->select('id', 'title', 'reject_note', 'rejected_by')
                ->where('status', 'REJECTED')
                ->where('user_id', $laravelUserId)
                ->get();

            if ($rejectedBooks->isEmpty()) {
                return;
            }

            foreach ($rejectedBooks as $book) {
                $rejectNote = $book->reject_note ?? 'Tidak ada catatan';
                $rejectedBy = $book->rejected_by;

                $rejectorRole = null;
                if ($rejectedBy) {
                    $hakAkses = DB::table('m_hak_akses')->where('user_id', $rejectedBy)->first();
                    if ($hakAkses) {
                        $aksesArray = array_map('trim', explode(',', $hakAkses->akses));
                        if (in_array('Lppm Ketua', $aksesArray)) {
                            $rejectorRole = 'Lppm Ketua';
                        } elseif (in_array('Lppm Staff', $aksesArray)) {
                            $rejectorRole = 'Lppm Staff';
                        }
                    }
                }

                if ($rejectorRole === 'Lppm Ketua') {
                    $title = 'Pengajuan Ditolak';
                    $messageFormat = "Ditolak: Maaf, pengajuan buku '{$book->title}' belum disetujui.";
                } else {
                    $title = 'Revisi Diperlukan';
                    $messageFormat = "Revisi: Dokumen buku '{$book->title}' perlu diperbaiki. Cek catatan: {$rejectNote}";
                }

                $referenceKey = 'REJECT_'.$book->id;

                $notifExists = Notification::where('user_id', $laravelUserId)
                    ->where('reference_key', $referenceKey)
                    ->exists();

                if (! $notifExists) {
                    // ✅ PERBAIKAN: Gunakan Model::create
                    Notification::create([
                        'user_id' => $laravelUserId,
                        'title' => $title,
                        'message' => $messageFormat,
                        'type' => 'Peringatan',
                        'is_read' => false,
                        'reference_key' => $referenceKey,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error creating book rejection notifications', ['error' => $e->getMessage()]);
        }
    }

    private function createBookPaymentNotifications($laravelUserId)
    {
        try {
            $approvedBooks = DB::table('book_submissions')
                ->select('id', 'title', 'approved_amount')
                ->where('status', 'APPROVED_CHIEF')
                ->whereNotNull('approved_amount')
                ->where('approved_amount', '>', 0)
                ->get();

            if ($approvedBooks->isEmpty()) {
                return;
            }

            foreach ($approvedBooks as $book) {
                $nominal = 'Rp '.number_format($book->approved_amount, 0, ',', '.');
                $message = "Bayar: Segera cairkan {$nominal} untuk buku '{$book->title}'.";
                $referenceKey = 'PAYMENT_CHIEF_'.$book->id;

                $notifExists = Notification::where('user_id', $laravelUserId)
                    ->where('reference_key', $referenceKey)
                    ->exists();

                if (! $notifExists) {
                    // ✅ PERBAIKAN: Gunakan Model::create
                    Notification::create([
                        'user_id' => $laravelUserId,
                        'title' => 'Pembayaran Penghargaan Buku',
                        'message' => $message,
                        'type' => 'Peringatan',
                        'is_read' => false,
                        'reference_key' => $referenceKey,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('[HRD Notification] Error', ['error' => $e->getMessage()]);
        }
    }

    private function createPaymentSuccessNotifications($laravelUserId)
    {
        try {
            $paidBooks = DB::table('book_submissions')
                ->select('id', 'title', 'payment_date')
                ->where('status', 'PAID')
                ->where('user_id', $laravelUserId)
                ->whereNotNull('payment_date')
                ->get();

            if ($paidBooks->isEmpty()) {
                return;
            }

            foreach ($paidBooks as $book) {
                $message = "Selamat! Dana insentif buku '{$book->title}' sudah cair.";
                $referenceKey = 'PAYMENT_SUCCESS_'.$book->id;

                $notifExists = Notification::where('user_id', $laravelUserId)
                    ->where('reference_key', $referenceKey)
                    ->exists();

                if (! $notifExists) {
                    // ✅ PERBAIKAN: Gunakan Model::create
                    Notification::create([
                        'user_id' => $laravelUserId,
                        'title' => 'Dana Insentif Buku Telah Cair',
                        'message' => $message,
                        'type' => 'Sukses',
                        'is_read' => false,
                        'reference_key' => $referenceKey,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('[Payment Success] Error', ['error' => $e->getMessage()]);
        }
    }

    // --- Actions ---

    public function markAsRead(Request $request, $id)
    {
        $authUser = $request->attributes->get('auth');
        $laravelUser = User::where('email', $authUser->email)->first();

        if (! $laravelUser) {
            return back()->with('error', 'User tidak ditemukan');
        }

        // Update bisa pakai DB::table karena tidak perlu insert ID baru
        Notification::where('id', $id)
            ->where('user_id', $laravelUser->id)
            ->update(['is_read' => true]);

        return back()->with('success', 'Notifikasi ditandai sudah dibaca');
    }

    public function markAllAsRead(Request $request)
    {
        $authUser = $request->attributes->get('auth');
        $laravelUser = User::where('email', $authUser->email)->first();

        if (! $laravelUser) {
            return back()->with('error', 'User tidak ditemukan');
        }

        Notification::where('user_id', $laravelUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back()->with('success', 'Semua notifikasi ditandai sudah dibaca');
    }

    /**
     * Kirim notifikasi pengajuan buku baru ke SEMUA Staff & Ketua LPPM (Batch)
     */
    public static function sendBookSubmissionNotification($bookId, $bookTitle, $submitterName)
    {
        try {
            $lppmUserIds = DB::table('m_hak_akses')
                ->where(function ($query) {
                    $query->where('akses', 'like', '%Lppm Staff%')
                        ->orWhere('akses', 'like', '%Lppm Ketua%');
                })
                ->pluck('user_id')->unique()->toArray();

            $lppmUsers = User::whereIn('id', $lppmUserIds)->pluck('id');

            $messageFormat = "{$submitterName} mengirim buku '{$bookTitle}'. Segera verifikasi.";
            $notificationsToInsert = [];
            $referenceKey = 'SUBMISSION_'.$bookId;

            foreach ($lppmUsers as $laravelUserId) {
                $notifExists = Notification::where('user_id', $laravelUserId)
                    ->where('reference_key', $referenceKey)
                    ->exists();

                if (! $notifExists) {
                    $notificationsToInsert[] = [
                        'id' => (string) Str::uuid(), // ✅ PERBAIKAN: UUID Manual untuk Batch Insert
                        'user_id' => $laravelUserId,
                        'title' => 'Pengajuan Buku Baru',
                        'message' => $messageFormat,
                        'type' => 'Info',
                        'is_read' => false,
                        'reference_key' => $referenceKey,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ];
                }
            }

            if (! empty($notificationsToInsert)) {
                DB::table('notifications')->insert($notificationsToInsert);
            }

        } catch (\Exception $e) {
            Log::error('Error in sendBookSubmissionNotification', ['error' => $e->getMessage()]);
        }
    }

    public static function sendBookRejectionNotification($bookId, $bookTitle, $submitterId, $rejectorId, $rejectNote = null)
    {
        try {
            if (empty($rejectorId)) {
                return;
            }

            DB::table('book_submissions')->where('id', $bookId)->update([
                'rejected_by' => $rejectorId,
                'updated_at' => Carbon::now(),
            ]);

            $laravelUser = User::find($submitterId);
            if (! $laravelUser) {
                return;
            }

            $rejectorRole = null;
            $hakAkses = DB::table('m_hak_akses')->where('user_id', $rejectorId)->first();

            if ($hakAkses) {
                $aksesArray = array_map('trim', explode(',', $hakAkses->akses));
                if (in_array('Lppm Ketua', $aksesArray)) {
                    $rejectorRole = 'Lppm Ketua';
                } elseif (in_array('Lppm Staff', $aksesArray)) {
                    $rejectorRole = 'Lppm Staff';
                }
            }

            if ($rejectorRole === 'Lppm Ketua') {
                $title = 'Pengajuan Ditolak';
                $message = "Ditolak: Maaf, pengajuan buku '{$bookTitle}' belum disetujui.";
            } else {
                $title = 'Revisi Diperlukan';
                $rejectNoteText = $rejectNote ?? 'Tidak ada catatan';
                $message = "Revisi: Dokumen buku '{$bookTitle}' perlu diperbaiki. Cek catatan: {$rejectNoteText}";
            }

            $referenceKey = 'REJECT_'.$bookId;

            $notifExists = Notification::where('user_id', $laravelUser->id)
                ->where('reference_key', $referenceKey)
                ->exists();

            if (! $notifExists) {
                // ✅ PERBAIKAN: Gunakan Model::create
                Notification::create([
                    'user_id' => $laravelUser->id,
                    'title' => $title,
                    'message' => $message,
                    'type' => 'Peringatan',
                    'is_read' => false,
                    'reference_key' => $referenceKey,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error in sendBookRejectionNotification', ['error' => $e->getMessage()]);
        }
    }

    public static function sendReviewerInvitationNotification($bookId, $bookTitle, $reviewerUserId)
    {
        try {
            $laravelUserId = $reviewerUserId;
            $user = User::find($laravelUserId);

            if (! $user) {
                return false;
            }

            $message = "Tugas Baru: Anda diundang me-review buku '{$bookTitle}'.";
            $referenceKey = 'REVIEWER_INVITE_'.$bookId.'_'.$laravelUserId;

            // ✅ PERBAIKAN: Gunakan updateOrCreate dari Model
            Notification::updateOrCreate(
                ['user_id' => $laravelUserId, 'reference_key' => $referenceKey],
                [
                    'title' => 'Undangan Review Buku',
                    'message' => $message,
                    'type' => 'Info',
                    'is_read' => false,
                ]
            );

            return true;

        } catch (\Exception $e) {
            Log::error('[Reviewer Invitation] ERROR: '.$e->getMessage());

            return false;
        }
    }

    public function submitReview(Request $request, $bookId)
    {
        $request->validate([
            'note' => 'required|string|max:2000',
            // notification_id bisa String/Int tergantung frontend kirim apa, hilangkan validasi integer keras
            'notification_id' => 'required',
        ]);

        try {
            $authUser = $request->attributes->get('auth');
            $laravelUser = User::where('email', $authUser->email)->first();

            if (! $laravelUser && isset($authUser->id)) {
                $laravelUser = User::find($authUser->id);
            }

            if (! $laravelUser) {
                return response()->json(['error' => 'User tidak ditemukan'], 404);
            }

            DB::beginTransaction();

            $bookReviewer = \App\Models\BookReviewer::where('book_submission_id', $bookId)
                ->where('user_id', $laravelUser->id)
                ->first();

            if (! $bookReviewer) {
                DB::rollBack();

                return response()->json(['error' => 'Data reviewer tidak ditemukan'], 404);
            }

            $bookReviewer->update([
                'note' => $request->note,
                'status' => 'ACCEPTED',
                'reviewed_at' => now(),
            ]);

            // Update notifikasi jadi terbaca
            Notification::where('id', $request->notification_id)->update(['is_read' => true]);

            $book = \App\Models\BookSubmission::find($bookId);
            if (! $book) {
                DB::rollBack();

                return response()->json(['error' => 'Buku tidak ditemukan'], 404);
            }

            // Kirim notifikasi balik ke pengundang (LPPM Ketua)
            if ($bookReviewer->invited_by) {
                $inviter = User::find($bookReviewer->invited_by);

                if ($inviter) {
                    $message = "Review Selesai: Hasil penilaian buku '{$book->title}' telah tersedia.";
                    $referenceKey = 'REVIEW_COMPLETE_'.$bookId.'_'.$laravelUser->id;

                    $existingNotif = Notification::where('reference_key', $referenceKey)->exists();

                    if (! $existingNotif) {
                        // ✅ PERBAIKAN: Gunakan Model::create
                        Notification::create([
                            'user_id' => $inviter->id,
                            'title' => 'Review Buku Selesai',
                            'message' => $message,
                            'type' => 'Sukses',
                            'is_read' => false,
                            'reference_key' => $referenceKey,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'Review berhasil dikirim');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Submit Review] Error', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Gagal mengirim review'], 500);
        }
    }

    public static function sendBookPaymentSuccessNotification($bookId, $bookTitle, $dosenUserId)
    {
        try {
            $laravelUser = User::find($dosenUserId);
            if (! $laravelUser) {
                return;
            }

            $message = "Selamat! Dana insentif buku '{$bookTitle}' sudah cair.";
            $referenceKey = 'PAYMENT_SUCCESS_'.$bookId;

            $notifExists = Notification::where('user_id', $laravelUser->id)
                ->where('reference_key', $referenceKey)
                ->exists();

            if (! $notifExists) {
                // ✅ PERBAIKAN: Gunakan Model::create
                Notification::create([
                    'user_id' => $laravelUser->id,
                    'title' => 'Dana Insentif Buku Telah Cair',
                    'message' => $message,
                    'type' => 'Sukses',
                    'is_read' => false,
                    'reference_key' => $referenceKey,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('[Payment Success] Error', ['error' => $e->getMessage()]);
        }
    }

    public static function sendBookPaymentNotification($bookId, $bookTitle, $approvedAmount)
    {
        try {
            $hrdUserIds = DB::table('m_hak_akses')
                ->where(function ($query) {
                    $query->where('akses', 'like', '%HRD%')
                        ->orWhere('akses', 'like', '%Hrd%')
                        ->orWhere('akses', 'like', '%hrd%');
                })
                ->pluck('user_id')->unique()->toArray();

            $hrdUsers = User::whereIn('id', $hrdUserIds)->pluck('id')->toArray();

            if (empty($hrdUsers)) {
                return;
            }

            $nominal = 'Rp '.number_format($approvedAmount, 0, ',', '.');
            $messageFormat = "Bayar: Segera cairkan {$nominal} untuk buku '{$bookTitle}'.";
            $notificationsToInsert = [];
            $referenceKey = 'PAYMENT_CHIEF_'.$bookId;

            foreach ($hrdUsers as $laravelUserId) {
                $notifExists = Notification::where('user_id', $laravelUserId)
                    ->where('reference_key', $referenceKey)
                    ->exists();

                if (! $notifExists) {
                    $notificationsToInsert[] = [
                        'id' => (string) Str::uuid(), // ✅ PERBAIKAN: UUID Manual untuk Batch
                        'user_id' => $laravelUserId,
                        'title' => 'Pembayaran Penghargaan Buku',
                        'message' => $messageFormat,
                        'type' => 'Peringatan',
                        'is_read' => false,
                        'reference_key' => $referenceKey,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ];
                }
            }

            if (! empty($notificationsToInsert)) {
                DB::table('notifications')->insert($notificationsToInsert);
            }

        } catch (\Exception $e) {
            Log::error('[Static] Error in sendBookPaymentNotification', ['error' => $e->getMessage()]);
        }
    }
}