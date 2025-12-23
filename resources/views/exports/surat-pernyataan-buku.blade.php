<!DOCTYPE html>
<html>
<head>
    <title>Surat Pernyataan Keaslian Karya</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; padding: 40px; }
        h1 { text-align: center; text-transform: uppercase; font-size: 18px; margin-bottom: 5px; }
        h2 { text-align: center; font-size: 14px; margin-top: 0; font-weight: normal; }
        .content { margin-top: 40px; }
        table { width: 100%; margin-top: 20px; border-collapse: collapse; }
        td { padding: 5px; vertical-align: top; }
        .label { width: 180px; font-weight: bold; }
        .signature { margin-top: 60px; float: right; width: 250px; text-align: center; }
        .footer { margin-top: 100px; font-size: 12px; color: #555; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
    </style>
</head>
<body>
    <h1>Surat Pernyataan Keaslian Karya</h1>
    <h2>Untuk Pengajuan Insentif Buku - LPPM IT Del</h2>

    <div class="content">
        <p>Saya yang bertanda tangan di bawah ini:</p>
        <table>
            <tr><td class="label">Nama Lengkap</td><td>: {{ $user->name }}</td></tr>
            <tr><td class="label">NIDN / NIK</td><td>: {{ $user->nidn ?? '-' }}</td></tr>
            <tr><td class="label">Unit Kerja</td><td>: Institut Teknologi Del</td></tr>
        </table>

        <p>Dengan ini menyatakan bahwa karya buku berikut:</p>
        <table>
            <tr><td class="label">Judul Buku</td><td>: <strong>{{ $book->title }}</strong></td></tr>
            <tr><td class="label">ISBN</td><td>: {{ $book->isbn }}</td></tr>
            <tr><td class="label">Penerbit</td><td>: {{ $book->publisher }}</td></tr>
            <tr><td class="label">Tahun Terbit</td><td>: {{ $book->publication_year }}</td></tr>
            <tr><td class="label">Penulis</td><td>: 
                @foreach($book->authors as $author)
                    {{ $author->name }} ({{ $author->role }})@if(!$loop->last), @endif
                @endforeach
            </td></tr>
        </table>

        <p style="margin-top: 20px; text-align: justify;">
            Adalah benar karya asli saya/kami dan belum pernah diajukan untuk mendapatkan insentif serupa sebelumnya. 
            Apabila di kemudian hari ditemukan ketidakbenaran dalam pernyataan ini, saya bersedia menerima sanksi sesuai ketentuan yang berlaku.
        </p>

        <div class="signature">
            <p>Laguboti, {{ $date }}</p>
            <br><br><br>
            <p><strong>{{ $user->name }}</strong></p>
        </div>
    </div>

    <div style="clear: both;"></div>
    <div class="footer">
        Dokumen ini digenerate secara otomatis oleh Sistem Informasi LPPM IT Del.<br>
        ID Pengajuan: #{{ $book->id }}
    </div>

    <script>
        // Otomatis buka dialog print saat halaman dibuka
        window.print();
    </script>
</body>
</html>