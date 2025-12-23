<?php

namespace App\Http\Controllers\App\HRD;

use App\Http\Controllers\App\Notifikasi\NotificationController;
use App\Http\Controllers\Controller;
use App\Models\BookSubmission;
use App\Models\SubmissionLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HRDController extends Controller
{
    /**
     * Menampilkan halaman daftar buku yang disetujui LPPM (status APPROVED_CHIEF)
     */
    public function index()
    {
        try {
            // ✅ Ambil semua buku dengan status APPROVED_CHIEF SAJA (exclude PAID)
            $books = DB::table('book_submissions')
                ->select(
                    'book_submissions.id',
                    'book_submissions.title as judul',
                    'book_submissions.approved_amount',
                    'book_submissions.created_at as tanggal_pengajuan',
                    'book_submissions.status',
                    'users.name as nama_dosen'
                )
                // Pastikan tipe data kolom user_id di kedua tabel cocok (sama-sama UUID atau Integer)
                ->join('users', 'book_submissions.user_id', '=', 'users.id')
                ->where('book_submissions.status', 'APPROVED_CHIEF') // ✅ Hanya APPROVED_CHIEF
                ->orderBy('book_submissions.created_at', 'desc')
                ->get();

            $formattedBooks = $books->map(function ($book) {
                return [
                    'id' => $book->id,
                    'judul' => $book->judul,
                    'nama_dosen' => $book->nama_dosen,
                    'status' => $book->status,
                    'status_label' => 'Disetujui LPPM',
                    'tanggal_pengajuan' => Carbon::parse($book->tanggal_pengajuan)->format('d/m/Y'),
                ];
            });

            Log::info('[HRD Index] Books loaded', [
                'count' => $formattedBooks->count(),
                'books' => $formattedBooks->toArray(),
            ]);

            // Sesuaikan string ini dengan lokasi file React Anda: 'app/home/kita-page.jsx'
            return Inertia::render('app/home/kita-page', [
                'submissions' => $formattedBooks,
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading HRD page', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Sesuaikan string ini dengan lokasi file React Anda: 'app/home/kita-page.jsx'
            return Inertia::render('app/home/kita-page', [
                'submissions' => [], // Return array kosong jika error
            ]);
        }
    }

    /**
     * Proses pencairan dana buku oleh HRD
     */
    public function storePencairan(Request $request)
    {
        // PERUBAHAN KECIL: Menghapus rule 'integer' pada book_id agar support UUID.
        // Jika ID masih integer, ini tetap aman.
        $validated = $request->validate([
            'book_id' => 'required|exists:book_submissions,id',
            'payment_date' => 'required|date',
        ]);

        DB::beginTransaction();

        try {
            $bookId = $validated['book_id'];
            $paymentDate = $validated['payment_date'];

            // Ambil data buku
            $book = BookSubmission::findOrFail($bookId);

            // Validasi status harus APPROVED_CHIEF
            if ($book->status !== 'APPROVED_CHIEF') {
                DB::rollback();
                Log::warning('[HRD Payment] Invalid status', [
                    'book_id' => $bookId,
                    'current_status' => $book->status,
                ]);

                return back()->with('error', 'Buku tidak dalam status yang valid untuk pencairan.');
            }

            Log::info('[HRD Payment] Processing payment disbursement', [
                'book_id' => $bookId,
                'book_title' => $book->title,
                'payment_date' => $paymentDate,
                'submitter_user_id' => $book->user_id,
            ]);

            // ✅ Update status menjadi PAID dan simpan tanggal pencairan
            $book->update([
                'status' => 'PAID',
                'payment_date' => $paymentDate,
                'updated_at' => Carbon::now(),
            ]);

            Log::info('[HRD Payment] Book status updated to PAID', [
                'book_id' => $bookId,
                'payment_date' => $paymentDate,
            ]);

            // Catat log aktivitas
            // Auth::id() aman digunakan meskipun UUID (return string)
            SubmissionLog::create([
                'book_submission_id' => $bookId,
                'user_id' => Auth::id(),
                'action' => 'PAYMENT_DISBURSED',
                'note' => "Dana penghargaan dicairkan oleh HRD pada tanggal {$paymentDate}",
            ]);

            // 🔥 KIRIM NOTIFIKASI KE DOSEN PENGAJU
            NotificationController::sendBookPaymentSuccessNotification(
                $bookId,
                $book->title,
                $book->user_id
            );

            DB::commit();

            Log::info('[HRD Payment] Payment disbursement successful', [
                'book_id' => $bookId,
                'status' => 'PAID',
                'notification_sent_to' => $book->user_id,
            ]);

            // ✅ Redirect dengan reload halaman
            return redirect()->route('hrd.kita.index')
                ->with('success', 'Pencairan dana berhasil diproses!');

        } catch (\Exception $e) {
            DB::rollback();

            Log::error('[HRD Payment] Error processing payment disbursement', [
                'book_id' => $validated['book_id'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Gagal memproses pencairan: '.$e->getMessage());
        }
    }
}