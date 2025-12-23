<?php

namespace Tests\Unit\Helper;

use App\Helper\ConstHelper;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ConstHelperTest extends TestCase
{
    #[Test]
    public function get_option_roles_returns_sorted_roles()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $expectedRoles = ['Admin', 'Todo'];

        // =====================================
        // Act (Aksi)
        // =====================================
        $result = ConstHelper::getOptionRoles();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($expectedRoles, $result);
        $this->assertIsArray($result);
        $this->assertContainsOnly('string', $result);
    }

    #[Test]
    public function option_roles_constant_contains_correct_values()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        $expectedRoles = ['Admin', 'Todo'];

        // =====================================
        // Act (Aksi)
        // =====================================
        $constantValue = ConstHelper::OPTION_ROLES;

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($expectedRoles, $constantValue);
        $this->assertCount(2, $constantValue);
    }

    #[Test]
    public function get_option_roles_always_returns_consistent_result()
    {
        // =====================================
        // Arrange (Persiapan)
        // =====================================
        // Tidak ada persiapan khusus

        // =====================================
        // Act (Aksi)
        // =====================================
        $firstCall = ConstHelper::getOptionRoles();
        $secondCall = ConstHelper::getOptionRoles();

        // =====================================
        // Assert (Verifikasi)
        // =====================================
        $this->assertEquals($firstCall, $secondCall);
    }
}
