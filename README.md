# ITDel Starter APP

## Logs

### [16-11-2025]

-   [Abdullah Ubaid] Inisialisasi proyek

## Quality Checks

### Composer Audit

Composer Audit adalah perintah Composer yang digunakan untuk memeriksa keamanan paket PHP yang terinstal di proyek.

```bash
composer audit
```

### NPM Audit

NPM Audit adalah perintah NPM yang digunakan untuk memeriksa keamanan paket NodeJS yang terinstal di proyek.

```bash
npm audit --audit-level=moderate
```

### Laravel Pint

Laravel pint untuk memeriksa dan memperbaiki format kode PHP secara otomatis.

#### Install Laravel Pint

```bash
composer require laravel/pint --dev
```

#### Melakukan perbaikan format kode PHP

```bash
vendor/bin/pint
```

### Eslint

ESLint adalah tools analisis kode statis untuk JavaScript dan TypeScript yang berfungsi mendeteksi error, menjaga konsistensi style, dan menerapkan best practices dalam penulisan kode

```bash
npx eslint . --format table
```

#### Melakukan pengecekan format kode PHP

```bash
vendor/bin/pint --test
```

### Larastan

Larastan adalah static code analysis tool yang menganalisis kode PHP Laravel tanpa harus menjalankannya.

#### Membuatuhkan file: phpstan.neon

```bash
includes:
    - ./vendor/larastan/larastan/extension.neon

parameters:
    level: 8 # Level 1 - 8 (unstrict - strict)
    paths:
        - app
        - routes
```

#### Install Larastan

```bash
composer require --dev larastan/larastan
```

#### Melakukan Analisis dengan Larastan

```bash
vendor/bin/phpstan analyse
```

### Testing Coverage

Testing Coverage untuk melakukan pengujian yang mencakup semua kemungkinan pada kode program yang dibuat guna mengurangi kemungkinan bug yang akan tejadi pada saat sudah di production.

#### Melakukan Pengujian dengan Coverage

```bash
php artisan test --coverage
```

### Melakukan Pengujian Spesifik

```bash
# php artisan test PATH_FILE_TEST
php artisan test tests/Feature/Livewire/Auth/LoginLivewireTest.php

php artisan test tests/Unit/Middleware/HandleInertiaRequestsTest.php

php artisan test tests/Feature/Controllers/Home/HomeControllerTest.php

php artisan test tests/Feature/Controllers/Auth/AuthControllerTest.php

php artisan test tests/Feature/Controllers/HakAkses/HakAksesControllerTest.php
```

## Catatan Syntax

```bash
# 🎯 TYPE DEFINITIONS (TypeScript Support)
npm i --save-dev @types/react

# 🎨 UI COMPONENTS (shadcn/ui)
npx shadcn@latest add checkbox
npx shadcn@latest add tabs

# 🔗 LARAVEL ZIGGY (Route Helper)
php artisan ziggy:generate resources/js/ziggy.js

# 🔧 ESLINT & CODE QUALITY

# Core ESLint dan plugins
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-unused-imports @eslint/js globals

# Babel parser dan preset
npm install -D @babel/eslint-parser
npm install -D @babel/preset-react

# Formatter dan additional plugins
npm install -D eslint-formatter-table
npm install eslint-plugin-react-hooks --save-dev
npm install --save-dev @eslint/js eslint-plugin-react eslint-plugin-react-hooks
```

## Template Tests

```php
<?php

namespace Tests\Unit;

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
```