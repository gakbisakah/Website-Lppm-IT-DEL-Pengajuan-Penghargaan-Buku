<?php

namespace App\Helper;

class ConstHelper
{
    /**
     * Daftar role yang tersedia dalam sistem
     *
     * @var array<int, string>
     */
    const OPTION_ROLES = [
        'Admin',
        'Todo',
    ];

    /**
     * Mendapatkan daftar role yang tersedia dalam urutan terurut
     *
     * @return array<int, string> Daftar role yang sudah diurutkan secara ascending
     *
     * @example
     * $roles = ConstHelper::getOptionRoles();
     * // Returns: ['Admin', 'Todo']
     *
     * @uses self::OPTION_ROLES
     */
    public static function getOptionRoles()
    {
        $roles = self::OPTION_ROLES;
        sort($roles);

        return $roles;
    }

    const OPTION_ROWS_PER_PAGE = [3, 5, 10, 25, 50, 100];
}
