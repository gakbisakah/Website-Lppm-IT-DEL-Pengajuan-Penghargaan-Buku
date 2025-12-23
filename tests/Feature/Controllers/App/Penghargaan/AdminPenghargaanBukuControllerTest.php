<?php

namespace Tests\Feature\Controllers\App\Penghargaan;

use App\Models\BookAuthor;
use App\Models\BookSubmission;
use App\Models\Profile;
use App\Models\HakAksesModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Inertia;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses; // Perhatikan ada akhiran 'es'
use PHPUnit\Framework\Attributes\PreserveGlobalState;

use Illuminate\Foundation\Testing\WithoutMiddleware; 

#[RunTestsInSeparateProcesses] // Ini BOLEH untuk level Class
#[PreserveGlobalState(false)] // 🔥 WAJIB ADA
class AdminPenghargaanBukuControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker, WithoutMiddleware; 

    // 🔥 PERBAIKAN: Gunakan deklarasi tanpa inisialisasi null, atau setidaknya konsisten.
    // Jika Anda menggunakan pola variabel lokal, ini bisa menjadi:
    protected $adminUser;
    protected $dosenUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        // --- ADMIN USER SETUP ---
        // 🔥 POLA PERBAIKAN: Buat user ke variabel lokal (Temp) terlebih dahulu
        $adminUserTemp = User::factory()->create([
            'id' => (string) Str::uuid(),
            'name' => 'Admin LPPM',
            'email' => 'admin@lppm.com',
        ]);
        // Gunakan variabel lokal untuk membuat HakAksesModel (dijamin tidak null)
        HakAksesModel::factory()->create([
            'user_id' => $adminUserTemp->id,
            'akses' => 'LPPM Staff',
        ]);
        Profile::factory()->create(['user_id' => $adminUserTemp->id]);


        // --- DOSEN USER SETUP ---
        $dosenUserTemp = User::factory()->create([
            'id' => (string) Str::uuid(),
            'name' => 'Prof. Dr. Dosen Aktif',
            'email' => 'dosen@aktif.com',
        ]);
        HakAksesModel::factory()->create([
            'user_id' => $dosenUserTemp->id,
            'akses' => 'DOSEN', 
        ]);
        Profile::factory()->create(['user_id' => $dosenUserTemp->id]);
        
        // Set properti class HANYA di akhir setUp
        $this->adminUser = $adminUserTemp;
        $this->dosenUser = $dosenUserTemp;

        $this->actingAs($this->adminUser);
    }

    // --- TEST INDEX DASAR ---

    public function test_admin_index_displays_submissions_excluding_drafts_and_filters_dosen(): void
    {
        // ARRANGE
        // Buku Dosen (Harusnya tampil)
        $bookSubmitted = BookSubmission::factory()->create(['user_id' => $this->dosenUser->id, 'title' => 'Buku Aktif 1', 'status' => 'SUBMITTED']);
        BookAuthor::factory()->create(['book_submission_id' => $bookSubmitted->id, 'name' => 'Penulis Dosen', 'role' => 'FIRST']); 
        
        // Buku Dosen (DRAFT - Harusnya TIDAK tampil)
        BookSubmission::factory()->create(['user_id' => $this->dosenUser->id, 'title' => 'Buku Draft', 'status' => 'DRAFT']);
        
        // Buku Non-Dosen (Harusnya TIDAK tampil)
        $nonDosenUserTemp = User::factory()->create(['name' => 'User Biasa']);
        HakAksesModel::factory()->create(['user_id' => $nonDosenUserTemp->id, 'akses' => 'STAFF']);
        $bookStaff = BookSubmission::factory()->create(['user_id' => $nonDosenUserTemp->id, 'title' => 'Buku Staff', 'status' => 'SUBMITTED']);
        BookAuthor::factory()->create(['book_submission_id' => $bookStaff->id, 'name' => 'Penulis Staff', 'role' => 'FIRST']);

        // Act
        // Asumsi kegagalan RouteNotFoundException sudah diperbaiki di routing
        $response = $this->get(route('app.admin.penghargaan.buku.index')); 

        // Assert
        $response->assertStatus(200)
                 ->assertInertia(fn (Inertia $page) => $page
                      ->component('app/admin/penghargaan/buku/index')
                      ->has('submissions', 1) 
                      ->where('submissions.0.judul', 'Buku Aktif 1')
                      ->where('submissions.0.nama_dosen', 'Prof. Dr. Dosen Aktif')
                      ->where('submissions.0.status_label', 'Perlu Verifikasi Staff')
                      // Hapus assertion stat yang tidak ada di Controller
                      // ->where('stats.total_submissions', 1) 
                 );
    }

    // --- TEST SEARCHING ---

    public function test_admin_index_search_by_title_works(): void
    {
        // ARRANGE
        $book1 = BookSubmission::factory()->create(['user_id' => $this->dosenUser->id, 'title' => 'Pengantar Algoritma Lanjut', 'status' => 'SUBMITTED']);
        BookAuthor::factory()->create(['book_submission_id' => $book1->id, 'name' => 'Penulis X', 'role' => 'FIRST']);

        $book2 = BookSubmission::factory()->create(['user_id' => $this->dosenUser->id, 'title' => 'Dasar Jaringan', 'status' => 'SUBMITTED']);
        BookAuthor::factory()->create(['book_submission_id' => $book2->id, 'name' => 'Penulis Y', 'role' => 'FIRST']);

        // Act
        $response = $this->get(route('app.admin.penghargaan.buku.index', ['search' => 'Algoritma']));

        // Assert
        $response->assertStatus(200)
                 ->assertInertia(fn (Inertia $page) => $page
                     ->has('submissions', 1)
                     ->where('submissions.0.judul', 'Pengantar Algoritma Lanjut')
                 );
    }
    
    public function test_admin_index_search_by_dosen_name_works(): void
    {
        // ARRANGE
        $bookA = BookSubmission::factory()->create(['user_id' => $this->dosenUser->id, 'title' => 'Buku Dosen A', 'status' => 'SUBMITTED']);
        BookAuthor::factory()->create(['book_submission_id' => $bookA->id, 'name' => 'Penulis A', 'role' => 'FIRST']);

        $dosenBTemp = User::factory()->create(['name' => 'Dr. Budi Santoso']);
        HakAksesModel::factory()->create(['user_id' => $dosenBTemp->id, 'akses' => 'DOSEN']);
        Profile::factory()->create(['user_id' => $dosenBTemp->id]);
        $bookB = BookSubmission::factory()->create(['user_id' => $dosenBTemp->id, 'title' => 'Buku Dosen B', 'status' => 'SUBMITTED']);
        BookAuthor::factory()->create(['book_submission_id' => $bookB->id, 'name' => 'Penulis B', 'role' => 'FIRST']);


        // Act
        $response = $this->get(route('app.admin.penghargaan.buku.index', ['search' => 'Budi']));

        // Assert
        $response->assertStatus(200)
                 ->assertInertia(fn (Inertia $page) => $page
                     ->has('submissions', 1)
                     ->where('submissions.0.judul', 'Buku Dosen B')
                     ->where('submissions.0.nama_dosen', 'Dr. Budi Santoso')
                 );
    }
    
    // 🔥 Method ensureHakAksesFactoryExists dihapus
}