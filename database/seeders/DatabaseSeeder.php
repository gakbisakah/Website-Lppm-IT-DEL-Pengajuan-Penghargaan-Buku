<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::truncate();


        User::create([
            'id' => '12e091b8-f227-4a58-8061-dc4a100c60f1', // <--- PENTING: UUID INI JANGAN UBAH
            'name' => 'Abdullah Ubaid',
            'email' => 'dosen@del.ac.id',
            'password' => Hash::make('password'), // Password login
        ]);

        // 2. Dosen Dummy 1
        User::create([
            'id' => '22e091b8-f227-4a58-8061-dc4a100c60f2',
            'name' => 'Dr. Budi Santoso',
            'email' => 'budi@del.ac.id',
            'password' => Hash::make('password'),
        ]);

        // 3. Dosen Dummy 2
        User::create([
            'id' => '33e091b8-f227-4a58-8061-dc4a100c60f3',
            'name' => 'Siti Aminah, M.T.',
            'email' => 'siti@del.ac.id',
            'password' => Hash::make('password'),
        ]);

        // 4. Dosen Dummy 3
        User::create([
            'id' => '44e091b8-f227-4a58-8061-dc4a100c60f4',
            'name' => 'Prof. Rahmat Hidayat',
            'email' => 'rahmat@del.ac.id',
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}