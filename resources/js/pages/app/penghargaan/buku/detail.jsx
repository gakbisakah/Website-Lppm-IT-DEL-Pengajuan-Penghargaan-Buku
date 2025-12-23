import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    Send,
    File,
    Clock,
    ExternalLink,
    AlertCircle,
    Download,
} from "lucide-react";
import { route } from "ziggy-js";
import Swal from "sweetalert2";

export default function DetailBukuPage({ book }) {
    const breadcrumbs = [
        { title: "Penghargaan", url: "#" },
        { title: "Buku", url: route("app.penghargaan.buku.index") },
        { title: "Detail", url: "#" },
    ];

    // --- VALIDASI KELENGKAPAN DOKUMEN ---
    let links = [];
    try {
        links = book.drive_link ? JSON.parse(book.drive_link) : [];
    } catch (e) {
        console.error("Gagal parse JSON link:", e);
        links = [];
    }

    const isDocumentsComplete =
        Array.isArray(links) &&
        links.filter((l) => {
            const url = typeof l === "string" ? l : l?.url;
            return url && url.trim() !== "";
        }).length >= 5;

    const isDraft = book.status === "Draft" || book.status === "DRAFT";
    const hasPdf = book.pdf_path && book.pdf_path.trim() !== "";

    // --- LOGIKA LABEL STATUS DINAMIS ---
    let displayStatus = book.status;
    let statusVariant = "outline";

    if (isDraft) {
        if (isDocumentsComplete) {
            displayStatus = "Draft (Siap Kirim)";
            statusVariant = "success";
        } else {
            displayStatus = "Draft (Belum Lengkap)";
            statusVariant = "secondary";
        }
    } else {
        const s = book.status.toLowerCase();
        if (s.includes("menunggu") || s.includes("submitted"))
            statusVariant = "warning";
        else if (s.includes("disetujui") || s.includes("approved"))
            statusVariant = "default";
        else if (s.includes("ditolak") || s.includes("rejected"))
            statusVariant = "destructive";
        else if (s.includes("selesai") || s.includes("paid"))
            statusVariant = "success";
    }

    // --- HANDLER KIRIM DENGAN SWEETALERT2 ---
    const handleSubmit = () => {
        Swal.fire({
            title: 'Konfirmasi Pengajuan',
            text: "Apakah Anda yakin data sudah benar? Pengajuan akan dikirim ke LPPM.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Kirim Sekarang!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            customClass: {
                confirmButton: 'mr-2',
                cancelButton: 'ml-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route("app.penghargaan.buku.submit", { id: book.id }), {}, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Berhasil!',
                            text: 'Pengajuan berhasil dikirim ke LPPM.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Terjadi kesalahan saat mengirim pengajuan.',
                            icon: 'error',
                            confirmButtonText: 'Tutup'
                        });
                    }
                });
            }
        });
    };

    const handleReviewFile = () => {
        window.open(
            route("app.penghargaan.buku.preview-pdf", { id: book.id }),
            "_blank"
        );
    };

    const handleDownloadPdf = () => {
        window.location.href = route("app.penghargaan.buku.download-pdf", {
            id: book.id,
        });
    };

    const getLinkUrl = (link) => {
        if (!link) return null;
        return typeof link === "string" ? link : link.url;
    };

    const getLinkName = (link, index) => {
        if (!link) return null;
        if (typeof link === "string") return `Dokumen ${index + 1}`;
        return link.name || `Dokumen ${index + 1}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail - ${book.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route("app.penghargaan.buku.index")}>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Detail Pengajuan Buku
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                ID Pengajuan: #{book.id}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={statusVariant}
                        className="text-sm px-3 py-1"
                    >
                        {displayStatus}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri: Informasi Utama */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Buku</CardTitle>
                                <CardDescription>
                                    Detail buku yang diajukan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Judul Buku
                                        </label>
                                        <p className="text-lg font-semibold">
                                            {book.title}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Penulis
                                            </label>
                                            <p>
                                                {book.authors &&
                                                book.authors.length > 0
                                                    ? book.authors
                                                          .map((a) => a.name)
                                                          .join(", ")
                                                    : "-"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-muted-foreground">
                                                ISBN
                                            </label>
                                            <p className="font-mono bg-muted px-2 py-1 rounded w-fit text-sm">
                                                {book.isbn}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Penerbit
                                            </label>
                                            <p>
                                                {book.publisher} (
                                                {book.publication_year})
                                            </p>
                                            <Badge
                                                variant="secondary"
                                                className="mt-1"
                                            >
                                                {book.publisher_level}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Kategori
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {book.book_type}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    • {book.total_pages} Hal
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dokumen Pendukung */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Dokumen Pendukung</CardTitle>
                                <CardDescription>
                                    Berkas yang telah diunggah (Wajib 5
                                    Dokumen).
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {links.length > 0 ? (
                                    <div className="space-y-2">
                                        {links.map((link, idx) => {
                                            const url = getLinkUrl(link);
                                            const name = getLinkName(link, idx);

                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center p-3 rounded-md border hover:bg-muted transition-colors group"
                                                >
                                                    <File className="h-5 w-5 text-primary mr-3" />
                                                    <div className="flex-1 truncate">
                                                        <p className="text-sm font-medium text-primary">
                                                            {name}
                                                            {!url && (
                                                                <span className="text-destructive ml-2 text-xs">
                                                                    (Belum
                                                                    Diunggah)
                                                                </span>
                                                            )}
                                                        </p>
                                                        {url ? (
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-muted-foreground truncate hover:underline flex items-center gap-1"
                                                            >
                                                                {url}{" "}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        ) : (
                                                            <p className="text-xs text-destructive italic">
                                                                Wajib diisi
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/5">
                                        <p className="text-muted-foreground text-sm italic">
                                            Belum ada dokumen diunggah.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Kolom Kanan: Status & Aksi */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Pengajuan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                Pengajuan Dibuat
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    book.created_at
                                                ).toLocaleString("id-ID", {
                                                    dateStyle: "long",
                                                    timeStyle: "short",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="mt-0.5">
                                            {isDraft ? (
                                                <AlertCircle
                                                    className={`h-5 w-5 ${
                                                        isDocumentsComplete
                                                            ? "text-primary"
                                                            : "text-amber-500"
                                                    }`}
                                                />
                                            ) : (
                                                <Clock className="h-5 w-5 text-amber-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">
                                                Status: {displayStatus}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {isDraft
                                                    ? isDocumentsComplete
                                                        ? "Dokumen lengkap. Klik tombol di bawah untuk mengirim."
                                                        : "Mohon lengkapi dokumen terlebih dahulu."
                                                    : "Sedang diproses oleh LPPM."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 border-t pt-4">
                                {/* TOMBOL 1: Review File */}
                                {isDraft && isDocumentsComplete && (
                                    <Button
                                        onClick={handleReviewFile}
                                        variant="outline"
                                        className="w-full border-primary text-primary hover:bg-primary/5"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Review File PDF
                                    </Button>
                                )}

                                {/* TOMBOL 2: Download PDF */}
                                {!isDraft && hasPdf && (
                                    <Button
                                        onClick={handleDownloadPdf}
                                        variant="outline"
                                        className="w-full border-primary text-primary hover:bg-primary/5"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Surat Permohonan
                                    </Button>
                                )}

                                {/* TOMBOL 3: Edit/Lengkapi Dokumen */}
                                {isDraft && (
                                    <Link
                                        href={route(
                                            "app.penghargaan.buku.upload",
                                            { id: book.id }
                                        )}
                                        className="w-full"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            {isDocumentsComplete
                                                ? "Edit Dokumen"
                                                : "Lengkapi Dokumen"}
                                        </Button>
                                    </Link>
                                )}

                                {/* TOMBOL 4: KIRIM PENGAJUAN */}
                                {isDraft && isDocumentsComplete && (
                                    <Button
                                        onClick={handleSubmit}
                                        variant="default"
                                        className="w-full shadow-md"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Kirim Pengajuan ke LPPM
                                    </Button>
                                )}

                                {/* INFO: Jika Sudah Dikirim */}
                                {!isDraft && (
                                    <div className="w-full p-3 bg-primary/10 text-primary text-center rounded-md text-sm font-medium border border-primary/20">
                                        <CheckCircle className="inline-block w-4 h-4 mr-2 mb-0.5" />
                                        Pengajuan berhasil dikirim ke LPPM.
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}