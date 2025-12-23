<?php

namespace App\Helper;

use Illuminate\Support\Str;

class ToolsHelper
{
    /**
     * Menyimpan authentication token ke session storage
     *
     * @param  string  $authToken  Token autentikasi yang akan disimpan
     * @return void
     *
     * @example
     * ToolsHelper::setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
     *
     * @see self::getAuthToken()
     */
    public static function setAuthToken($authToken)
    {
        session(['auth_token' => $authToken]);
    }

    /**
     * Mendapatkan authentication token dari session storage
     *
     * @return string Authentication token atau string kosong jika tidak ada
     *
     * @example
     * $token = ToolsHelper::getAuthToken();
     * // Returns: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' atau ''
     *
     * @see self::setAuthToken()
     */
    public static function getAuthToken()
    {
        return session('auth_token', '');
    }

    /**
     * Menghasilkan UUID (Universally Unique Identifier) versi 4 sebagai ID unik
     *
     * @return string UUID string dalam format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     *
     * @example
     * $id = ToolsHelper::generateId();
     * // Returns: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
     *
     * @uses \Illuminate\Support\Str::uuid()
     */
    public static function generateId()
    {
        return Str::uuid()->toString();
    }

    /**
     * Memeriksa apakah role/user memiliki akses berdasarkan allowed roles
     *
     * @param  string  $role  Role yang akan diperiksa
     * @param  string|string[]  $allowedRoles  Role atau array roles yang diizinkan
     * @return bool True jika role ada dalam allowed roles, false jika tidak
     */
    public static function checkRoles($role, $allowedRoles)
    {
        return is_array($allowedRoles)
            ? in_array($role, $allowedRoles)
            : $role === $allowedRoles;
    }

    /**
     * Menghasilkan range kolom Excel dari start hingga end
     *
     * Mendukung increment hingga multiple letters (A → Z → AA → AB → ...)
     *
     * @param  string  $start  Kolom awal (contoh: 'A')
     * @param  string  $end  Kolom akhir (contoh: 'D')
     * @return string[] Array berisi urutan kolom Excel
     *
     * @example
     * // Basic range
     * $columns = ToolsHelper::excelColumnRange('A', 'D');
     * // Returns: ['A', 'B', 'C', 'D']
     * @example
     * // Multiple letters
     * $columns = ToolsHelper::excelColumnRange('Z', 'AC');
     * // Returns: ['Z', 'AA', 'AB', 'AC']
     * @example
     * // Single column
     * $columns = ToolsHelper::excelColumnRange('B', 'B');
     * // Returns: ['B']
     */
    public static function excelColumnRange($start, $end)
    {
        $columns = [];
        $current = $start;
        while (true) {
            $columns[] = $current;
            if ($current === $end) {
                break;
            }
            $current = ++$current;  // increment seperti Excel (A → B → ... → Z → AA)
        }

        return $columns;
    }

    /**
     * Mendapatkan nilai RAW dari sel Excel (nilai asli yang tersimpan)
     *
     * @param  \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet  $worksheet  Worksheet object
     * @param  int|string  $colIndex  Indeks kolom (1-based: 1 = A, 2 = B, atau string A/B/C)
     * @param  int  $rowIndex  Indeks baris
     * @return string Nilai sel dalam bentuk string yang di-trim
     */
    public static function getValueExcel($worksheet, $colIndex, $rowIndex)
    {
        $columnLetter = is_int($colIndex) ? \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex) : $colIndex;
        $cellAddress = $columnLetter.$rowIndex;
        $cell = $worksheet->getCell($cellAddress);

        return trim((string) $cell->getValue());  // Mengambil nilai RAW
    }

    /**
     * Mendapatkan nilai yang sudah DIFORMAT sesuai tampilan di Excel
     *
     * @param  \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet  $worksheet  Worksheet object
     * @param  int|string  $colIndex  Indeks kolom (1-based: 1 = A, 2 = B, atau string A/B/C)
     * @param  int  $rowIndex  Indeks baris
     * @return string Nilai yang sudah diformat dalam bentuk string yang di-trim
     */
    public static function getFormattedValueExcel($worksheet, $colIndex, $rowIndex)
    {
        $columnLetter = is_int($colIndex) ? \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex) : $colIndex;
        $cellAddress = $columnLetter.$rowIndex;
        $cell = $worksheet->getCell($cellAddress);

        return trim((string) $cell->getFormattedValue());  // Mengambil nilai yang sudah diformat
    }
}
