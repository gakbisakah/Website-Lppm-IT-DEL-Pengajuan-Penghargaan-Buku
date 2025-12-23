<?php

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ToolsHelperTest extends TestCase
{
    #[Test]
    public function contoh_format_pengujian()
    {
        // -------------------------------------
        // Arrange (Persiapan)
        // -------------------------------------
        $nilai1 = 10;
        $nilai2 = 20;
        $expected = 30;

        // -------------------------------------
        // Act (Aksi)
        // -------------------------------------
        $hasil = $nilai1 + $nilai2;

        // -------------------------------------
        // Assert (Verifikasi)
        // -------------------------------------
        $this->assertEquals($expected, $hasil);
    }
}
