import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";

// Import UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    ArrowLeft,
    FileText,
    XCircle,
    ExternalLink,
    Loader2,
    FileType,
    AlertCircle,
} from "lucide-react";

// Helper Layout
const SideBySideFormField = ({ label, children }) => (
    <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-8">
        <label className="text-sm font-medium text-gray-700 md:w-1/4 min-w-[200px]">
            {label}:
        </label>
        <div className="flex-1">{children}</div>
    </div>
);

const StackedFormField = ({ label, children }) => (
    <div className="flex flex-col space-y-1 mt-4">
        <label className="text-sm font-medium text-gray-700">{label}:</label>
        <div>{children}</div>
    </div>
);

export default function Staff({ book }) {
    // Popup penolakan
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!book) return <div>Loading data...</div>;
    const links = Array.isArray(book.drive_link) ? book.drive_link : [];

    // Cek apakah ada PDF
    const hasPdfFile = book.pdf_path ? true : false;

    // Tautan pertama (dianggap sebagai tautan folder utama)
    const documentLink = links.length > 0 ? links[0] : null;

    const handleAction = () => router.visit(route("regis-semi.indexx"));

    // Fungsi untuk membuka folder dokumen
    const handleOpenDocument = () => {
        if (documentLink) {
            window.open(documentLink, "_blank");
        }
    };

    const submitReject = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            route("regis-semi.rejectStaff", book.id),
            { note: rejectNote },
            {
                onSuccess: () => {
                    setIsRejectOpen(false);
                    setIsSubmitting(false);
                    setRejectNote("");
                    router.visit(route("regis-semi.indexx"));
                },
                onError: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <AppLayout>
            <Head title={`Verifikasi - ${book.title}`} />

            <div className="max-w-7xl mx-auto p-4 md:px-8 space-y-6 pb-20">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleAction}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Verifikasi Buku
                            </h1>
                            <p className="text-sm text-gray-500">
                                Pengusul: {book.dosen}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={
                            book.status === "APPROVED_CHIEF"
                                ? "success"
                                : "outline"
                        }
                    >
                        {book.status_label}
                    </Badge>
                </div>

                {/* DETAIL BUKU */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <SideBySideFormField label="Judul Buku">
                            {/* UBAH: bg-gray-50 -> bg-muted (theme-aware) */}
                            <Input
                                value={book.title || ""}
                                readOnly
                                className="bg-muted"
                            />
                        </SideBySideFormField>

                        <SideBySideFormField label="ISBN">
                            {/* UBAH: bg-gray-50 -> bg-muted (theme-aware) */}
                            <Input
                                value={book.isbn || ""}
                                readOnly
                                className="bg-muted font-mono"
                            />
                        </SideBySideFormField>

                        <SideBySideFormField label="Penerbit">
                            {/* UBAH: bg-gray-50 -> bg-muted (theme-aware) */}
                            <Input
                                value={book.publisher || ""}
                                readOnly
                                className="bg-muted"
                            />
                        </SideBySideFormField>

                        {/* PDF SECTION */}
                        {hasPdfFile && (
                            <div className="mt-6 pt-4 border-t">
                                <StackedFormField label="File PDF Buku">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {/* UBAH: text-green-600 -> text-primary (theme-aware) */}
                                            <FileType className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-medium text-gray-700">
                                                PDF Surat Permohonan Tersedia
                                            </span>
                                        </div>
                                    </div>
                                </StackedFormField>
                            </div>
                        )}

                        {/* LIST DOKUMEN */}
                        <div className="mt-8 pt-4 border-t">
                            {/* UBAH: text-gray-900 -> text-foreground (theme-aware) */}
                            <h3 className="font-semibold mb-4 text-foreground">
                                Dokumen Pendukung
                            </h3>

                            {links.length > 0 ? (
                                <div className="space-y-3">
                                    {links.map((link, idx) => {
                                        const isPdf =
                                            link &&
                                            (link
                                                .toLowerCase()
                                                .includes(".pdf") ||
                                                link.includes(
                                                    "drive.google.com/file"
                                                ));

                                        return (
                                            <StackedFormField
                                                key={idx}
                                                label={`Dokumen #${idx + 1}${
                                                    isPdf ? " (PDF)" : ""
                                                }`}
                                            >
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={link}
                                                        readOnly
                                                        // UBAH: hardcoded colors -> bg-muted, text-primary (theme-aware)
                                                        className={`bg-muted text-primary underline cursor-pointer`}
                                                    />
                                                    <a
                                                        href={link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title={
                                                                isPdf
                                                                    ? "Buka PDF"
                                                                    : "Buka Link"
                                                            }
                                                        >
                                                            {isPdf ? (
                                                                <FileType className="h-4 w-4" />
                                                            ) : (
                                                                <ExternalLink className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </a>
                                                </div>
                                            </StackedFormField>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-yellow-800 bg-yellow-100 p-3 rounded-md">
                                    <AlertCircle className="h-4 w-4" />
                                    <p className="text-sm">
                                        Tidak ada link dokumen pendukung.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* --- TOMBOL UTAMA (DIUBAH MENJADI 3 KOLOM) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Buka Folder Dokumen */}
                    <Button
                        variant="secondary"
                        // UBAH: border-gray-200 -> border-input (theme-aware)
                        className="h-12 border border-input"
                        onClick={handleOpenDocument}
                        disabled={!documentLink}
                    >
                        <FileText className="mr-2 h-5 w-5" />
                        Buka Folder Dokumen Pendukung
                    </Button>

                    {/* 2. Download PDF (jika ada) */}
                    {hasPdfFile ? (
                        <Button
                            variant="outline"
                            // UBAH: hardcoded blue -> border-primary text-primary hover:bg-primary/5 (theme-aware)
                            className="h-12 border-primary text-primary hover:bg-primary/5"
                            onClick={() =>
                                window.open(
                                    route("regis-semi.download-pdf", book.id),
                                    "_blank"
                                )
                            }
                        >
                            <FileType className="mr-2 h-5 w-5" />
                            Download PDF
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            // UBAH: hardcoded gray -> border-input text-muted-foreground hover:bg-muted (theme-aware)
                            className="h-12 border-input text-muted-foreground hover:bg-muted"
                            disabled
                        >
                            <FileType className="mr-2 h-5 w-5" />
                            Tidak Ada PDF
                        </Button>
                    )}

                    {/* 3. Tombol TOLAK */}
                    <Button
                        onClick={() => setIsRejectOpen(true)}
                        // UBAH: hardcoded red -> variant="destructive" (theme-aware)
                        variant="destructive"
                        className="h-12"
                        disabled={
                            book.status === "APPROVED_CHIEF" ||
                            book.status === "REJECTED"
                        }
                    >
                        <XCircle className="mr-2 h-5 w-5" /> Tolak
                    </Button>
                </div>
            </div>

            {/* POPUP TOLAK */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        {/* UBAH: text-red-600 -> text-destructive (theme-aware) */}
                        <DialogTitle className="text-destructive">
                            Tolak Pengajuan
                        </DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan agar dosen dapat
                            memperbaikinya.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitReject} className="space-y-4 py-4">
                        <Label htmlFor="note">Alasan Penolakan / Revisi</Label>
                        <Textarea
                            id="note"
                            className="min-h-[120px]"
                            placeholder="Contoh: Dokumen scan tidak jelas..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            required
                            autoFocus
                        />

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsRejectOpen(false)}
                            >
                                Batal
                            </Button>

                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isSubmitting || !rejectNote}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mengirim...
                                    </>
                                ) : (
                                    "Kirim Penolakan"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
