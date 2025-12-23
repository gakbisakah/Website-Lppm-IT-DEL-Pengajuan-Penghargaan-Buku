<?php

namespace Tests\Unit\Helper;

use App\Helper\ToolsHelper;
use Illuminate\Support\Facades\Session;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ToolsHelperTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Session::flush();  // Clear session sebelum setiap test
    }

    #[Test]
    public function set_auth_token_menyimpan_token_ke_session()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $token = 'sample-auth-token-123';

        // =====================================
        // Act (Aksi)
        // =====================================
        ToolsHelper::setAuthToken($token);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($token, Session::get('auth_token'));
    }

    #[Test]
    public function get_auth_token_mengembalikan_token_dari_session()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $token = 'test-token-456';
        Session::put('auth_token', $token);

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getAuthToken();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($token, $result);
    }

    #[Test]
    public function get_auth_token_mengembalikan_string_kosong_jika_token_tidak_ada()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        Session::forget('auth_token');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getAuthToken();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('', $result);
    }

    #[Test]
    public function generate_id_mengembalikan_uuid_string()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Tidak ada persiapan khusus untuk generateId()

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::generateId();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertIsString($result);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $result
        );
    }

    #[Test]
    public function generate_id_mengembalikan_uuid_unik()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Tidak ada persiapan khusus

        // =====================================
        // Act (Aksi)
        // =====================================
        $uuid1 = ToolsHelper::generateId();
        $uuid2 = ToolsHelper::generateId();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertNotEquals($uuid1, $uuid2);
    }

    #[Test]
    public function check_roles_berhasil_dengan_allowed_roles_array()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $allowedRoles = ['admin', 'user', 'editor'];

        // =====================================
        // Act (Aksi) & Assert (Verifikasi)
        // =====================================
        $this->assertTrue(ToolsHelper::checkRoles('admin', $allowedRoles));
        $this->assertTrue(ToolsHelper::checkRoles('user', $allowedRoles));
        $this->assertTrue(ToolsHelper::checkRoles('editor', $allowedRoles));
        $this->assertFalse(ToolsHelper::checkRoles('guest', $allowedRoles));
    }

    #[Test]
    public function check_roles_berhasil_dengan_allowed_roles_string()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $allowedRoles = 'admin';

        // =====================================
        // Act (Aksi) & Assert (Verifikasi)
        // =====================================
        $this->assertTrue(ToolsHelper::checkRoles('admin', $allowedRoles));
        $this->assertFalse(ToolsHelper::checkRoles('user', $allowedRoles));
    }

    #[Test]
    public function check_roles_mengembalikan_false_untuk_allowed_roles_bukan_array_atau_string()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Tidak ada persiapan khusus

        // =====================================
        // Act (Aksi) & Assert (Verifikasi)
        // =====================================
        $this->assertFalse(ToolsHelper::checkRoles('admin', 123));
        $this->assertFalse(ToolsHelper::checkRoles('admin', null));
        $this->assertFalse(ToolsHelper::checkRoles('admin', true));
        $this->assertFalse(ToolsHelper::checkRoles('admin', new \stdClass));
    }

    #[Test]
    public function check_roles_mengembalikan_false_untuk_roles_kosong()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $allowedRoles = ['admin', 'user'];

        // =====================================
        // Act (Aksi) & Assert (Verifikasi)
        // =====================================
        $this->assertFalse(ToolsHelper::checkRoles('', $allowedRoles));
        $this->assertFalse(ToolsHelper::checkRoles(null, $allowedRoles));
    }

    #[Test]
    public function excel_column_range_berhasil_dari_a_ke_d()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $start = 'A';
        $end = 'D';
        $expected = ['A', 'B', 'C', 'D'];

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::excelColumnRange($start, $end);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($expected, $result);
    }

    #[Test]
    public function excel_column_range_berhasil_dari_a_ke_a()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $start = 'A';
        $end = 'A';
        $expected = ['A'];

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::excelColumnRange($start, $end);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($expected, $result);
    }

    #[Test]
    public function excel_column_range_berhasil_dari_x_ke_z()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $start = 'X';
        $end = 'Z';
        $expected = ['X', 'Y', 'Z'];

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::excelColumnRange($start, $end);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($expected, $result);
    }

    #[Test]
    public function excel_column_range_berhasil_dari_z_ke_ab()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $start = 'Z';
        $end = 'AB';
        $expected = ['Z', 'AA', 'AB'];

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::excelColumnRange($start, $end);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($expected, $result);
    }

    #[Test]
    public function excel_column_range_berhasil_dari_a_a_ke_ac()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $start = 'AA';
        $end = 'AC';
        $expected = ['AA', 'AB', 'AC'];

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::excelColumnRange($start, $end);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($expected, $result);
    }

    #[Test]
    public function get_value_excel_dengan_col_index_int()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('B5')
            ->willReturn($cellMock);

        $cellMock
            ->method('getValue')
            ->willReturn('Test Value');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getValueExcel($worksheet, 2, 5);  // colIndex = 2 (B), rowIndex = 5

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('Test Value', $result);
    }

    #[Test]
    public function get_value_excel_dengan_col_index_string()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('C10')
            ->willReturn($cellMock);

        $cellMock
            ->method('getValue')
            ->willReturn('String Value');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getValueExcel($worksheet, 'C', 10);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('String Value', $result);
    }

    #[Test]
    public function get_value_excel_trim_spaces()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('A1')
            ->willReturn($cellMock);

        $cellMock
            ->method('getValue')
            ->willReturn('  Value with spaces  ');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getValueExcel($worksheet, 1, 1);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('Value with spaces', $result);
    }

    #[Test]
    public function get_value_excel_dengan_nilai_kosong()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('D15')
            ->willReturn($cellMock);

        $cellMock
            ->method('getValue')
            ->willReturn('');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getValueExcel($worksheet, 'D', 15);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('', $result);
    }

    #[Test]
    public function get_value_excel_dengan_nilai_null()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('E20')
            ->willReturn($cellMock);

        $cellMock
            ->method('getValue')
            ->willReturn(null);

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getValueExcel($worksheet, 'E', 20);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('', $result);
    }

    #[Test]
    public function get_formatted_value_excel_dengan_col_index_int()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('F8')
            ->willReturn($cellMock);

        $cellMock
            ->method('getFormattedValue')
            ->willReturn('Formatted Value');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getFormattedValueExcel($worksheet, 6, 8);  // colIndex = 6 (F), rowIndex = 8

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('Formatted Value', $result);
    }

    #[Test]
    public function get_formatted_value_excel_dengan_col_index_string()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('G12')
            ->willReturn($cellMock);

        $cellMock
            ->method('getFormattedValue')
            ->willReturn('$1,000.00');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getFormattedValueExcel($worksheet, 'G', 12);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('$1,000.00', $result);
    }

    #[Test]
    public function get_formatted_value_excel_trim_spaces()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('H3')
            ->willReturn($cellMock);

        $cellMock
            ->method('getFormattedValue')
            ->willReturn('  Formatted with spaces  ');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getFormattedValueExcel($worksheet, 'H', 3);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('Formatted with spaces', $result);
    }

    #[Test]
    public function get_formatted_value_excel_dengan_nilai_kosong()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $worksheet = $this->createMock(Worksheet::class);
        $cellMock = $this->createMock(\PhpOffice\PhpSpreadsheet\Cell\Cell::class);

        $worksheet
            ->method('getCell')
            ->with('I7')
            ->willReturn($cellMock);

        $cellMock
            ->method('getFormattedValue')
            ->willReturn('');

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ToolsHelper::getFormattedValueExcel($worksheet, 'I', 7);

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('', $result);
    }

    #[Test]
    public function coordinate_string_from_column_index_berfungsi_dengan_benar()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Tidak ada persiapan khusus

        // =====================================
        // Act (Aksi) & Assert (Verifikasi)
        // =====================================
        $this->assertEquals('A', Coordinate::stringFromColumnIndex(1));
        $this->assertEquals('B', Coordinate::stringFromColumnIndex(2));
        $this->assertEquals('Z', Coordinate::stringFromColumnIndex(26));
        $this->assertEquals('AA', Coordinate::stringFromColumnIndex(27));
        $this->assertEquals('AB', Coordinate::stringFromColumnIndex(28));
    }

    #[Test]
    public function session_persistence_antara_set_dan_get_auth_token()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $token = 'persistent-token-789';

        // =====================================
        // Act (Aksi)
        // =====================================
        ToolsHelper::setAuthToken($token);
        $retrievedToken = ToolsHelper::getAuthToken();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($token, $retrievedToken);
    }

    #[Test]
    public function multiple_set_auth_token_menimpa_nilai_sebelumnya()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Tidak ada persiapan khusus

        // =====================================
        // Act (Aksi)
        // =====================================
        ToolsHelper::setAuthToken('first-token');
        ToolsHelper::setAuthToken('second-token');
        $result = ToolsHelper::getAuthToken();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals('second-token', $result);
    }
}
