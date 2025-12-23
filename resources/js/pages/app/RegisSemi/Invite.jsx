import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Search,
    UserPlus,
    CheckCircle2,
    Loader2,
    Users,
    Mail,
    User,
    Shield,
    Filter,
    BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

// Buat komponen Badge sederhana yang theme-aware
const Badge = ({ children, variant = "default", className = "" }) => {
    const baseStyles =
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";

    const variants = {
        // Menggunakan kelas tema Shadcn
        default: "bg-secondary text-secondary-foreground",
        // Varian Success (menggunakan warna Primary/Success dari tema)
        success: "bg-primary/10 text-primary border border-primary/20",
        destructive:
            "bg-destructive/10 text-destructive border border-destructive/20",
        outline: "border border-input text-foreground",
    };

    // Peta lama ke varian baru
    let variantKey = variant;
    if (variant === "green" || variant === "blue") {
        variantKey = "success";
    } else if (variant === "red" || variant === "yellow") {
        variantKey = "destructive";
    }

    const variantStyle = variants[variantKey] || variants.default;

    return (
        <span className={`${baseStyles} ${variantStyle} ${className}`}>
            {children}
        </span>
    );
};

export default function Invite({ book, availableReviewers = [], flash }) {
    const [search, setSearch] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [filterDosenOnly, setFilterDosenOnly] = useState(true); // Default filter hanya Dosen
    const [localReviewers, setLocalReviewers] = useState(availableReviewers);

    // Tampilkan toast dari flash message jika ada
    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Filter dosen berdasarkan pencarian
    let filteredReviewers = localReviewers.filter(
        (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.user_id.toLowerCase().includes(search.toLowerCase())
    );

    // Filter tambahan: hanya tampilkan yang punya akses Dosen
    if (filterDosenOnly) {
        filteredReviewers = filteredReviewers.filter(
            (user) => user.has_dosen_akses
        );
    }

    // Handler dengan approach terbaik - kombinasi
    const handleInviteFinal = (userId) => {
        setProcessingId(userId);

        // Menggunakan window.axios jika tersedia (Laravel default)
        if (window.axios) {
            window.axios
                .post(route("regis-semi.store-invite", book.id), {
                    user_id: userId,
                })
                .then((response) => {
                    setProcessingId(null);

                    if (response.data.success || response.data.message) {
                        toast.success(
                            response.data.message || "Undangan berhasil dikirim"
                        );

                        // Update local state
                        setLocalReviewers((prevReviewers) =>
                            prevReviewers.map((reviewer) =>
                                reviewer.user_id === userId
                                    ? { ...reviewer, is_invited: true }
                                    : reviewer
                            )
                        );
                    }
                })
                .catch((error) => {
                    setProcessingId(null);

                    if (error.response) {
                        // Server responded with error
                        const errorMessage =
                            error.response.data?.message ||
                            error.response.data?.error ||
                            "Gagal mengundang reviewer";
                        toast.error(errorMessage);
                    } else if (error.request) {
                        // No response received
                        toast.error("Tidak ada respons dari server");
                    } else {
                        // Something else
                        toast.error("Terjadi kesalahan");
                    }
                });
        } else {
            // Fallback to fetch (disederhanakan)
            toast.error("Axios tidak tersedia. Gagal mengundang reviewer.");
            setProcessingId(null);
        }
    };

    // Hitung statistik berdasarkan localReviewers
    const stats = {
        totalReviewers: localReviewers.length,
        withDosenAkses: localReviewers.filter((r) => r.has_dosen_akses).length,
        available: localReviewers.filter((r) => !r.is_invited).length,
        invited: localReviewers.filter((r) => r.is_invited).length,
        filteredCount: filteredReviewers.length,
    };

    return (
        <AppLayout>
            <Head title={`Undang Reviewer - ${book.title}`} />

            <div className="max-w-5xl mx-auto p-4 md:px-8 space-y-6 pb-20">
                {/* Header & Back Button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            router.visit(route("regis-semi.show", book.id))
                        }
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Pilih Reviewer
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Cari dosen yang kompeten untuk menilai buku:{" "}
                            <span className="font-medium text-foreground">
                                {/* PERBAIKAN 1: &quot; pengganti " */}
                                &quot;{book.title}&quot;
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Kolom Kiri: Search & List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan user_id, nama, atau email..."
                                    className="pl-10 h-12 text-base"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button
                                variant={
                                    filterDosenOnly ? "default" : "outline"
                                }
                                size="sm"
                                className="h-12 whitespace-nowrap"
                                onClick={() =>
                                    setFilterDosenOnly(!filterDosenOnly)
                                }
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                {filterDosenOnly
                                    ? "Hanya Dosen"
                                    : "Semua Akses"}
                            </Button>
                            <div className="text-sm text-muted-foreground whitespace-nowrap">
                                <span className="font-medium">
                                    {stats.filteredCount}
                                </span>{" "}
                                tersedia
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredReviewers.length > 0 ? (
                                filteredReviewers.map((reviewer) => (
                                    <Card
                                        key={reviewer.user_id}
                                        className={`hover:border-primary/50 transition-colors ${
                                            reviewer.has_dosen_akses
                                                ? "border-l-4 border-l-primary bg-primary/10"
                                                : ""
                                        }`}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            reviewer.name
                                                        )}&background=10b981&color=ffffff`}
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {reviewer.name.charAt(
                                                            0
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        <h4 className="font-semibold text-sm md:text-base">
                                                            {reviewer.name}
                                                            {reviewer.has_dosen_akses && (
                                                                <BadgeCheck className="inline ml-2 h-4 w-4 text-primary" />
                                                            )}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-xs text-muted-foreground">
                                                            {reviewer.email}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Shield className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            ID:{" "}
                                                            {reviewer.user_id.substring(
                                                                0,
                                                                8
                                                            )}
                                                            ...
                                                        </p>
                                                    </div>

                                                    {reviewer.has_dosen_akses && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            <Badge
                                                                variant="success"
                                                                className="text-xs"
                                                            >
                                                                Dosen
                                                            </Badge>
                                                            {!filterDosenOnly &&
                                                                reviewer.akses_list &&
                                                                reviewer
                                                                    .akses_list
                                                                    .length >
                                                                    1 && (
                                                                    <span className="text-xs text-muted-foreground ml-1">
                                                                        (
                                                                        {reviewer
                                                                            .akses_list
                                                                            .length -
                                                                            1}{" "}
                                                                        akses
                                                                        lainnya)
                                                                    </span>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {reviewer.is_invited ? (
                                                    <Button
                                                        variant="secondary"
                                                        disabled
                                                        className="gap-2 text-primary border border-primary/20 bg-primary/10 hover:bg-primary/10"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Terundang
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleInviteFinal(
                                                                reviewer.user_id
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            reviewer.user_id
                                                        }
                                                        variant={
                                                            reviewer.has_dosen_akses
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                    >
                                                        {processingId ===
                                                        reviewer.user_id ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Mengundang...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus className="mr-2 h-4 w-4" />
                                                                Undang
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    {search ? (
                                        <div className="space-y-2">
                                            <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                                            <p>
                                                Tidak ditemukan dosen dengan
                                                {/* PERBAIKAN 2: &quot; pengganti " */}
                                                pencarian &quot;{search}&quot;.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSearch("")}
                                            >
                                                Reset Pencarian
                                            </Button>
                                        </div>
                                    ) : filterDosenOnly ? (
                                        <div className="space-y-2">
                                            <Filter className="h-12 w-12 mx-auto text-muted-foreground" />
                                            <p>
                                                Tidak ada reviewer dengan akses
                                                Dosen.
                                            </p>
                                            <p className="text-sm">
                                                {/* PERBAIKAN 3: &quot; pengganti " */}
                                                Coba matikan filter &quot;Hanya
                                                Dosen&quot;.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setFilterDosenOnly(false)
                                                }
                                            >
                                                Tampilkan Semua Akses
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                                            <p>
                                                Tidak ada data reviewer
                                                tersedia.
                                            </p>
                                            <p className="text-sm">
                                                Semua reviewer sudah diundang
                                                atau tidak ada data.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kolom Kanan: Info */}
                    <div className="space-y-6">
                        <Card className="bg-muted/30 border-dashed">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Informasi Reviewer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-3 text-muted-foreground">
                                <p className="flex items-start gap-2">
                                    <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>
                                            Semua yang ditampilkan adalah Dosen
                                        </strong>
                                        .
                                    </span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <Filter className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span>
                                        {/* PERBAIKAN 4: &quot; pengganti " */}
                                        Filter{" "}
                                        <strong>
                                            &quot;Hanya Dosen&quot;
                                        </strong>{" "}
                                        aktif - hanya menampilkan user dengan
                                        akses Dosen.
                                    </span>
                                </p>
                                <p>
                                    • User mungkin memiliki akses lain, tetapi
                                    yang relevan untuk review buku adalah akses{" "}
                                    <strong>Dosen</strong>.
                                </p>
                                <p>
                                    • Anda dapat mengundang lebih dari satu
                                    reviewer.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/20 bg-primary/10">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2 text-primary">
                                    <BadgeCheck className="h-5 w-5" />
                                    Statistik Dosen
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Total Dosen</span>
                                    <span className="font-semibold text-primary">
                                        {stats.totalReviewers}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck className="h-3 w-3 text-primary" />
                                        <span className="text-sm">
                                            Dengan Akses Dosen
                                        </span>
                                    </div>
                                    <span className="font-semibold text-primary">
                                        {stats.withDosenAkses}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Tersedia</span>
                                    <span className="font-semibold">
                                        {stats.available}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Terundang</span>
                                    <span className="font-semibold text-primary">
                                        {stats.invited}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-primary/20">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">
                                            Mode Tampilan
                                        </span>
                                        <Badge
                                            variant={
                                                filterDosenOnly
                                                    ? "success"
                                                    : "outline"
                                            }
                                            className="text-xs"
                                        >
                                            {filterDosenOnly
                                                ? "Hanya Dosen"
                                                : "Semua Akses"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Informasi Sistem
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-muted-foreground">
                                <p>
                                    Sistem hanya menampilkan user yang memiliki{" "}
                                    <strong>akses Dosen</strong>.
                                </p>
                                <p>
                                    User mungkin memiliki akses lain (Admin,
                                    Staff, dll), tetapi untuk review buku hanya
                                    status <strong>Dosen</strong> yang relevan.
                                </p>
                                <div className="mt-2 pt-2 border-t">
                                    <p className="font-medium text-foreground">
                                        Prinsip Seleksi:
                                    </p>
                                    <p className="text-xs mt-1">
                                        1. Memiliki akses Dosen (wajib)
                                    </p>
                                    <p className="text-xs">
                                        2. Akses lain tidak ditampilkan untuk
                                        fokus pada kapasitas sebagai reviewer
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
