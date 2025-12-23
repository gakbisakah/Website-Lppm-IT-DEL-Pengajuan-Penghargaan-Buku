<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Formulir 8 - Permohonan Penghargaan Buku</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            padding: 40px 60px; /* Margin standar surat */
            max-width: 210mm; /* A4 width */
            margin: auto;
        }
        .form-code { font-weight: bold; margin-bottom: 20px; }
        .date-place { text-align: right; margin-bottom: 20px; }
        .header-table td { vertical-align: top; padding-bottom: 5px; }
        .content { margin-top: 30px; }
        .data-table { width: 100%; border-collapse: collapse; margin-left: 20px; margin-bottom: 20px; }
        .data-table td { vertical-align: top; padding: 2px 5px; }
        .label-col { width: 160px; }
        .separator { width: 10px; }
        
        .checklist-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            font-size: 11pt; 
        }
        .checklist-table th, .checklist-table td { 
            border: 1px solid black; 
            padding: 5px; 
        }
        .checklist-table th { text-align: center; background-color: #f0f0f0; }
        
        .signature { 
            float: right; 
            width: 250px; 
            text-align: left; 
            margin-top: 40px; 
            margin-bottom: 40px;
        }
        .signature p { margin: 0; }
        .signature-name { margin-top: 70px; font-weight: bold; text-decoration: underline; }
        
        @media print {
            @page { size: A4; margin: 2cm; }
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body onload="window.print()">

    <div class="form-code">Formulir 8. Surat Permohonan Mendapatkan Penghargaan Buku</div>

    <div class="date-place">
        Laguboti, {{ $date }}
    </div>

    <table class="header-table">
        <tr>
            <td width="80">Perihal</td>
            <td>: <strong>Surat Permohonan Mendapatkan Penghargaan</strong></td>
        </tr>
        <tr>
            <td>Lampiran</td>
            <td>: 1 Berkas</td>
        </tr>
    </table>

    <div style="margin-top: 20px;">
        Kepada Yth.<br>
        <strong>Ketua LPPM Institut Teknologi Del</strong><br>
        di-<br>
        &nbsp;&nbsp;&nbsp;&nbsp;Tempat
    </div>

    <div class="content">
        <p>Saya yang bertanda tangan di bawah ini:</p>
        
        <table class="data-table">
            <tr>
                <td class="label-col">Nama</td>
                <td class="separator">:</td>
                <td>{{ $user->name }}</td>
            </tr>
            <tr>
                <td>NIDN</td>
                <td>:</td>
                <td>{{ $user->nidn ?? '..................................................' }}</td>
            </tr>
            <tr>
                <td>Prodi</td>
                <td>:</td>
                <td>{{ $user->prodi ?? '..................................................' }}</td>
            </tr>
            <tr>
                <td>Sinta ID</td>
                <td>:</td>
                <td>{{ $user->sinta_id ?? '..................................................' }}</td>
            </tr>
            <tr>
                <td>Scopus ID</td>
                <td>:</td>
                <td>{{ $user->scopus_id ?? '..................................................' }}</td>
            </tr>
        </table>

        <p>Dengan ini memohon mendapatkan penghargaan buku dengan rincian sebagai berikut:</p>

        <table class="data-table">
            <tr>
                <td class="label-col">Judul Buku</td>
                <td class="separator">:</td>
                <td><strong>{{ $book->title }}</strong></td>
            </tr>
            <tr>
                <td>Jenis Buku</td>
                <td>:</td>
                <td>{{ $book->book_type }}</td>
            </tr>
            <tr>
                <td>Bidang Keilmuan</td>
                <td>:</td>
                <td>..................................................</td>
            </tr>
            <tr>
                <td>Penerbit</td>
                <td>:</td>
                <td>{{ $book->publisher }}</td>
            </tr>
            <tr>
                <td>ISBN</td>
                <td>:</td>
                <td>{{ $book->isbn }}</td>
            </tr>
            <tr>
                <td>Jumlah Halaman</td>
                <td>:</td>
                <td>{{ $book->total_pages }} Halaman</td>
            </tr>
            <tr>
                <td>Penulis</td>
                <td>:</td>
                <td>
                    <ol style="margin: 0; padding-left: 20px;">
                        @foreach($book->authors as $author)
                            <li>{{ $author->name }} ({{ $author->role == 'FIRST' ? 'Penulis Utama' : 'Anggota' }})</li>
                        @endforeach
                    </ol>
                </td>
            </tr>
        </table>

        <p>Demikian surat permohonan ini saya sampaikan, terima kasih.</p>

        <div class="signature">
            <p>Hormat Saya,</p>
            <div class="signature-name">({{ $user->name }})</div>
            <p>NIDN: {{ $user->nidn ?? '....................' }}</p>
        </div>

        <div style="clear: both;"></div>

        <p style="font-weight: bold; margin-bottom: 5px;">Ceklis Lampiran:</p>
        <table class="checklist-table">
            <thead>
                <tr>
                    <th width="30">No</th>
                    <th>Artefak / Dokumen</th>
                    <th>Ketersediaan (Link G-Drive)</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $links = json_decode($book->drive_link, true) ?? [];
                    $labels = [
                        'Berita Acara Serah Terima Buku ke Perpustakaan',
                        'Hasil Scan Penerbitan Buku',
                        'Hasil Review oleh Penerbit',
                        'Surat Pernyataan Keaslian (Ditandatangani)'
                    ];
                @endphp

                @foreach($labels as $index => $label)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}.</td>
                    <td>{{ $label }}</td>
                    <td style="font-size: 10pt; color: blue;">
                        {{ $links[$index] ?? '..................................................' }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>