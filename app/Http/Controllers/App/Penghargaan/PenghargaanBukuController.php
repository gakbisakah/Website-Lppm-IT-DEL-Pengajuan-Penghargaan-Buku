<?php

namespace App\Http\Controllers\App\Penghargaan;

use App\Http\Controllers\App\Notifikasi\NotificationController;
use App\Http\Controllers\Controller;
use App\Models\BookAuthor;
use App\Models\BookSubmission;
use App\Models\Profile;
use App\Models\SubmissionLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PenghargaanBukuController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $books = BookSubmission::with('authors')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $mappedBooks = $books->map(function ($book) {
            $authorNames = $book->authors->pluck('name')->join(', ');

            return [
                'id' => $book->id,
                'judul' => $book->title,
                'penulis' => $authorNames,
                'penerbit' => $book->publisher,
                'tahun' => $book->publication_year,
                'isbn' => $book->isbn,
                'tanggal_pengajuan' => $book->created_at->format('d/m/Y'),
                'status' => $this->formatStatus($book->status),
                'kategori' => $this->mapBookTypeToLabel($book->book_type),
                'jumlah_halaman' => $book->total_pages,
            ];
        });

        return Inertia::render('app/penghargaan/buku/page', [
            'pageName' => 'Penghargaan Buku',
            'buku' => $mappedBooks,
        ]);
    }

    public function create()
    {
        return Inertia::render('app/penghargaan/buku/create', [
            'pageName' => 'Formulir Pengajuan Buku',
        ]);
    }

    public function store(Request $request)
    {
        $userId = Auth::id();

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'required|string|max:255',
            'tahun' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'isbn' => 'required|string|max:20',
            'kategori' => 'required|string',
            'jumlah_halaman' => 'required|integer|min:40',
            'level_penerbit' => 'required|in:NATIONAL,INTERNATIONAL,NATIONAL_ACCREDITED',
        ]);

        DB::beginTransaction();

        try {
            $bookType = $validated['kategori'];

            $book = BookSubmission::create([
                'user_id' => $userId,
                'title' => $validated['judul'],
                'isbn' => $validated['isbn'],
                'publication_year' => $validated['tahun'],
                'publisher' => $validated['penerbit'],
                'publisher_level' => $validated['level_penerbit'],
                'book_type' => $bookType,
                'total_pages' => $validated['jumlah_halaman'],
                'status' => 'DRAFT',
            ]);

            $authors = explode(',', $validated['penulis']);
            $dosenName = 'Dosen Pengaju (Anda)';

            BookAuthor::create([
                'book_submission_id' => $book->id,
                'user_id' => $userId,
                'name' => $dosenName,
                'role' => 'FIRST',
                'affiliation' => 'Institut Teknologi Del',
            ]);

            foreach ($authors as $authorName) {
                $cleanName = trim($authorName);
                if (! empty($cleanName)) {
                    BookAuthor::create([
                        'book_submission_id' => $book->id,
                        'name' => $cleanName,
                        'role' => 'MEMBER',
                        'affiliation' => 'External/Other',
                    ]);
                }
            }

            SubmissionLog::create([
                'book_submission_id' => $book->id,
                'user_id' => $userId,
                'action' => 'CREATE_DRAFT',
                'note' => 'Membuat draft pengajuan buku baru.',
            ]);

            DB::commit();

            return redirect()->route('app.penghargaan.buku.upload', ['id' => $book->id]);

        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Gagal menyimpan data: '.$e->getMessage()]);
        }
    }

    public function show($id, Request $request)
    {
        $book = BookSubmission::with('authors')->findOrFail($id);

        $userId = $book->user_id;

        $profile = DB::table('profiles')
            ->where('user_id', $userId)
            ->first();

        return Inertia::render('app/penghargaan/buku/detail', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'isbn' => $book->isbn,
                'publisher' => $book->publisher,
                'publication_year' => $book->publication_year,
                'publisher_level' => $book->publisher_level,
                'book_type' => $this->mapBookTypeToLabel($book->book_type),
                'total_pages' => $book->total_pages,
                'status' => $this->formatStatus($book->status),
                'drive_link' => $book->drive_link,
                'pdf_path' => $book->pdf_path,
                'created_at' => $book->created_at,
                'authors' => $book->authors->map(function ($a) {
                    return ['name' => $a->name, 'role' => $a->role];
                }),
            ],
            'user' => [
                'name' => $profile->name ?? '-',
                'NIDN' => $profile->nidn ?? '-',
                'ProgramStudi' => $profile->prodi ?? '-',
                'SintaID' => $profile->sinta_id ?? '-',
                'ScopusID' => $profile->scopus_id ?? '-',
            ],
        ]);
    }

    public function uploadDocs($id)
    {
        $book = BookSubmission::findOrFail($id);

        return Inertia::render('app/penghargaan/buku/upload-docs', [
            'pageName' => 'Unggah Dokumen Pendukung',
            'bookId' => $book->id,
            'bookTitle' => $book->title,
        ]);
    }

    public function storeUpload(Request $request, $id)
    {
        $userId = Auth::id();

        $request->validate([
            'links' => 'required|array',
            'links.*' => 'nullable|url',
        ]);

        DB::beginTransaction();

        try {
            $book = BookSubmission::findOrFail($id);
            $linksJson = json_encode($request->links);

            $book->update([
                'drive_link' => $linksJson,
                'status' => 'DRAFT',
            ]);

            Log::info('Starting PDF generation', ['book_id' => $book->id]);

            $pdfPath = $this->generateAndSavePdf($book);

            Log::info('PDF generated successfully', [
                'book_id' => $book->id,
                'pdf_path' => $pdfPath,
                'file_exists' => Storage::exists($pdfPath),
            ]);

            SubmissionLog::create([
                'book_submission_id' => $book->id,
                'user_id' => $userId,
                'action' => 'UPLOAD_DOCUMENTS',
                'note' => 'Dokumen pendukung diunggah dan PDF surat permohonan di-generate di: '.$pdfPath,
            ]);

            DB::commit();

            return redirect()->route('app.penghargaan.buku.detail', $book->id)
                ->with('success', 'Dokumen dan PDF berhasil disimpan! Silakan review PDF sebelum mengirim.');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to save documents and generate PDF', [
                'book_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Gagal menyimpan dokumen: '.$e->getMessage());
        }
    }

    public function submit($id)
    {
        $book = BookSubmission::findOrFail($id);

        if ($book->status !== 'DRAFT') {
            return back()->with('error', 'Pengajuan sudah dikirim atau diproses.');
        }

        $links = json_decode($book->drive_link, true);

        if (! $links || count(array_filter($links)) < 5) {
            return back()->with('error', 'Dokumen belum lengkap. Harap lengkapi semua link dokumen sebelum mengirim.');
        }

        DB::beginTransaction();

        try {
            // Cek apakah PDF sudah ada, jika belum generate
            if (! $book->pdf_path || ! Storage::exists($book->pdf_path)) {
                $pdfPath = $this->generateAndSavePdf($book);
                Log::info('PDF re-generated on submit', [
                    'book_id' => $book->id,
                    'pdf_path' => $pdfPath,
                ]);
            }

            // Update status
            $book->update([
                'status' => 'SUBMITTED',
            ]);

            SubmissionLog::create([
                'book_submission_id' => $book->id,
                'user_id' => Auth::id(),
                'action' => 'SUBMIT',
                'note' => 'Pengajuan dikirim final oleh dosen.',
            ]);

            // 🔥 KIRIM NOTIFIKASI KE LPPM STAFF & KETUA
            $authUser = Auth::user();
            $profile = Profile::where('user_id', $authUser->id)->first();
            $dosenName = $profile->name ?? $authUser->name ?? 'Dosen';

            // Panggil method static untuk kirim notifikasi
            NotificationController::sendBookSubmissionNotification(
                $book->id,
                $book->title,
                $dosenName
            );

            DB::commit();

            return redirect()->route('app.penghargaan.buku.index')
                ->with('success', 'Pengajuan BERHASIL dikirim ke LPPM.');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to submit', [
                'book_id' => $book->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Gagal mengirim pengajuan: '.$e->getMessage());
        }
    }

    public function previewPdf($id, Request $request)
    {
        $book = BookSubmission::with('authors')->findOrFail($id);

        Log::info('Preview PDF requested', [
            'book_id' => $book->id,
            'pdf_path' => $book->pdf_path,
            'file_exists' => $book->pdf_path ? Storage::exists('public/'.$book->pdf_path) : false,
        ]);

        if ($book->pdf_path && Storage::exists('public/'.$book->pdf_path)) {
            $fullPath = storage_path('app/public/'.$book->pdf_path);

            Log::info('Serving stored PDF', ['full_path' => $fullPath]);

            if (file_exists($fullPath)) {
                return response()->file($fullPath);
            }
        }

        Log::warning('PDF not found in storage, regenerating...', ['book_id' => $book->id]);

        try {
            $pdfPath = $this->generateAndSavePdf($book);

            $fullPath = storage_path('app/public/'.$pdfPath);

            if (file_exists($fullPath)) {
                return response()->file($fullPath);
            }
        } catch (\Exception $e) {
            Log::error('Failed to regenerate PDF', [
                'book_id' => $book->id,
                'error' => $e->getMessage(),
            ]);
        }

        $userId = $book->user_id;

        $profile = DB::table('profiles')
            ->where('user_id', $userId)
            ->first();

        $links = json_decode($book->drive_link, true) ?? [];

        $documentLabels = [
            'Berita Acara Serah Terima Buku ke Perpustakaan',
            'Hasil Scan Penerbitan Buku',
            'Hasil Review oleh Penerbit',
            'Surat Pernyataan (Penerbitan Tidak Didanai oleh Institusi + Bukti Biaya Penerbitan)',
        ];

        $userData = (object) [
            'name' => $profile->name ?? '-',
            'NIDN' => $profile->nidn ?? '-',
            'ProgramStudi' => $profile->prodi ?? '-',
            'SintaID' => $profile->sinta_id ?? '-',
            'ScopusID' => $profile->scopus_id ?? '-',
        ];

        $data = [
            'book' => $book,
            'user' => $userData,
            'links' => $links,
            'documentLabels' => $documentLabels,
            'date' => now()->format('d-m-Y'),
            'authors' => $book->authors->pluck('name')->toArray(),
        ];

        $pdf = Pdf::loadView('pdf.book-submission', $data);

        return $pdf->stream('Surat_Permohonan_Penghargaan_Buku_'.$book->id.'.pdf');
    }

    private function generateAndSavePdf($book)
    {
        try {
            $book->load('authors');

            Log::info('Generating PDF for book', [
                'book_id' => $book->id,
                'title' => $book->title,
            ]);

            $userId = $book->user_id;

            $profile = DB::table('profiles')
                ->where('user_id', $userId)
                ->first();

            $links = json_decode($book->drive_link, true) ?? [];

            $documentLabels = [
                'Berita Acara Serah Terima Buku ke Perpustakaan',
                'Hasil Scan Penerbitan Buku',
                'Hasil Review oleh Penerbit',
                'Surat Pernyataan (Penerbitan Tidak Didanai oleh Institusi + Bukti Biaya Penerbitan)',
            ];

            $userData = (object) [
                'name' => $profile->name ?? '-',
                'NIDN' => $profile->nidn ?? '-',
                'ProgramStudi' => $profile->prodi ?? '-',
                'SintaID' => $profile->sinta_id ?? '-',
                'ScopusID' => $profile->scopus_id ?? '-',
            ];

            $data = [
                'book' => $book,
                'user' => $userData,
                'links' => $links,
                'documentLabels' => $documentLabels,
                'date' => now()->format('d-m-Y'),
                'authors' => $book->authors->pluck('name')->toArray(),
            ];

            Log::info('PDF data prepared', ['has_authors' => count($data['authors'])]);

            $pdf = Pdf::loadView('pdf.book-submission', $data);

            $filename = 'book_submission_'.$book->id.'_'.time().'.pdf';
            $directory = 'public/pdfs/book-submissions';
            $path = $directory.'/'.$filename;

            Log::info('Saving PDF to storage', ['path' => $path]);

            if (! Storage::exists($directory)) {
                Storage::makeDirectory($directory);
                Log::info('Created directory', ['directory' => $directory]);
            }

            $pdfOutput = $pdf->output();
            $saved = Storage::put($path, $pdfOutput);

            Log::info('Storage put result', ['saved' => $saved, 'path' => $path]);

            if (! Storage::exists($path)) {
                throw new \Exception('Failed to save PDF file to storage. Path: '.$path);
            }

            $fileSize = Storage::size($path);
            Log::info('PDF file verified', [
                'path' => $path,
                'size' => $fileSize,
                'full_path' => storage_path('app/'.$path),
            ]);

            $dbPath = 'pdfs/book-submissions/'.$filename;

            $updated = DB::table('book_submissions')
                ->where('id', $book->id)
                ->update([
                    'pdf_path' => $dbPath,
                    'updated_at' => now(),
                ]);

            Log::info('Database update result', [
                'updated' => $updated,
                'db_path' => $dbPath,
                'storage_path' => $path,
            ]);

            $verifyPath = DB::table('book_submissions')
                ->where('id', $book->id)
                ->value('pdf_path');

            if (! $verifyPath) {
                throw new \Exception('Failed to update pdf_path in database');
            }

            Log::info('PDF generation completed successfully', [
                'book_id' => $book->id,
                'pdf_path' => $dbPath,
                'db_verified' => $verifyPath,
            ]);

            return $dbPath;

        } catch (\Exception $e) {
            Log::error('PDF generation failed', [
                'book_id' => $book->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function downloadPdf($id)
    {
        $book = BookSubmission::findOrFail($id);

        if (! $book->pdf_path) {
            return back()->with('error', 'File PDF tidak ditemukan.');
        }

        $storagePath = 'public/'.$book->pdf_path;

        if (! Storage::exists($storagePath)) {
            return back()->with('error', 'File PDF tidak ditemukan di server.');
        }

        return Storage::download($storagePath, 'Surat_Permohonan_Buku_'.$book->id.'.pdf');
    }

    private function formatStatus($status)
    {
        return match ($status) {
            'DRAFT' => 'Draft',
            'SUBMITTED' => 'Menunggu Verifikasi Staff',
            'VERIFIED_STAFF' => 'Menunggu Review Ketua',
            'APPROVED_CHIEF' => 'Disetujui LPPM',
            'REJECTED' => 'Ditolak/Perlu Revisi',
            'PAID' => 'Selesai (Cair)',
            default => $status,
        };
    }

    private function mapBookTypeToLabel($type)
    {
        return match ($type) {
            'TEACHING' => 'Buku Ajar',
            'REFERENCE' => 'Buku Referensi',
            'MONOGRAPH' => 'Monograf',
            'CHAPTER' => 'Book Chapter',
            default => $type,
        };
    }
}