import React, { useEffect, useState } from "react";
import AppLayout from "@/layouts/app-layout";
// 🔥 PERBAIKAN: Import 'router' dari Inertia
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Plus, Search, ChevronDown } from "lucide-react";
// Import Input dipertahankan, tetapi menggunakan elemen <input> di toolbar search
//import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { route } from "ziggy-js";
import Swal from "sweetalert2";
import * as Icon from "@tabler/icons-react";

// ==========================================
// FUNGSI UTILITY STATUS COLOR (TIDAK BERUBAH)
// ==========================================


// ==========================================
// KOMPONEN BUKU ITEM MINI (TIDAK BERUBAH)
// ==========================================
const BukuItemMini = ({ id, judul, penulis, status, tanggal, onClick }) => {
    const statusColor =
        status === "Disetujui (Ke HRD)" || status === "Selesai (Cair)"
            ? "text-primary"
            : status === "Ditolak/Revisi"
            ? "text-destructive"
            : "text-muted-foreground";

    return (
        <div
            className="bg-card rounded-lg shadow-sm border border-input/20 mb-3 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onClick(id)}
        >
            <div className="flex items-stretch p-4">
                <div className="mr-4 flex items-center justify-center w-8 h-8 rounded-full bg-primary flex-shrink-0">
                    <Icon.IconTriangle
                        size={16}
                        className="text-primary-foreground"
                        fill="currentColor"
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="font-medium text-base truncate text-foreground">
                        {judul}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                        {penulis}
                    </div>
                </div>
                <div className="text-right ml-4 flex flex-col justify-between items-end">
                    <div className="text-muted-foreground text-sm whitespace-nowrap">
                        Status :{" "}
                        <span
                            className={`capitalize font-normal ${statusColor}`}
                        >
                            {status === "belum disetujui"
                                ? "belum disetujui"
                                : status}
                        </span>
                    </div>
                    <div className="text-muted-foreground text-xs mt-2">
                        {tanggal}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// KOMPONEN SELECT DROPDOWN REUSABLE (TIDAK BERUBAH)
// ==========================================
const SelectDropdown = ({
    label,
    options,
    className = "",
    onChange,
    value,
}) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <div
                className={`flex items-center justify-between border border-input rounded-md bg-background text-sm px-3 h-10 cursor-pointer ${className}`}
            >
                <span className="text-foreground">{label}</span>
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
            {options.map((option) => (
                <DropdownMenuItem
                    key={option}
                    onSelect={() => onChange(option)}
                    className={value === option ? "bg-accent font-medium" : ""}
                >
                    {option}
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
);

// ==========================================
// KOMPONEN UTAMA BUKU PAGE
// ==========================================
export default function BukuPage({ buku }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBy, setSearchBy] = useState("Judul");
    const [sortBy, setSortBy] = useState("Terbaru");

    const searchByOptions = ["Judul", "Dosen"];
    const sortByOptions = ["Terbaru", "Judul"];

    const handleAjukanBukuClick = () => {
        router.visit(route("app.penghargaan.buku.create"));
    };

    // 🔥 FIX: Fungsi ini sekarang seharusnya berfungsi karena 'router' diimpor di atas.
    const handleBukuClick = (id) => {
        router.visit(route("app.penghargaan.buku.detail", { id }));
    };

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: "Berhasil!",
                text: flash.success,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "var(--primary)",
                timer: 3000,
                timerProgressBar: true,
            });
        }
    }, [flash]);

    const breadcrumbs = [
        { title: "Penghargaan", url: "#" },
        { title: "Buku", url: "#" },
    ];

    const filteredBooks = buku
        .filter((item) => {
            const currentSearchTerm = searchTerm.toLowerCase();
            if (!currentSearchTerm) return true;

            let targetField;
            if (searchBy === "Dosen") {
                targetField = item.penulis;
            } else if (searchBy === "Judul") {
                targetField = item.judul;
            } else {
                targetField = item.judul;
            }

            return targetField
                ? targetField.toLowerCase().includes(currentSearchTerm)
                : false;
        })
        .sort((a, b) => {
            if (sortBy === "Terbaru") {
                return b.id - a.id;
            }
            if (sortBy === "Judul") {
                return a.judul.localeCompare(b.judul);
            }
            return 0;
        });

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth={true}>
            <Head title="Penghargaan Buku" />

            <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 py-6">
                {/* 1. Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Penghargaan Buku
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola dan pantau status pengajuan buku Anda.
                        </p>
                    </div>
                    <Link href={route("app.penghargaan.buku.create")}>
                        <Button
                            variant="default"
                            className="w-full md:w-auto"
                            onClick={handleAjukanBukuClick}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajukan Buku Baru
                        </Button>
                    </Link>
                </div>

                {/* 2. TOOLBAR: Search & Sort (Perbaikan Ikon Search sudah diterapkan) */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
                    {/* KIRI: Search Input Group */}
                    <div className="flex-1 flex gap-2">
                        {/* Container Input (Relative) */}
                        <div className="relative w-full md:w-96 h-10">
                            {/* Ikon terpusat vertikal dan tidak interaktif */}
                            <Search className="absolute left-2.5 inset-y-0 my-auto h-4 w-4 text-muted-foreground pointer-events-none" />

                            {/* Menggunakan elemen <input> standar */}
                            <input
                                type="text"
                                placeholder="Cari judul, penulis..."
                                className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Tombol Search */}
                        <Button
                            variant="secondary"
                            className="h-10 px-4 rounded-md border border-input shadow-none font-normal text-sm flex-shrink-0"
                        >
                            Search
                        </Button>
                    </div>

                    {/* KANAN: Dropdowns */}
                    <div className="flex gap-4">
                        <div className="w-full md:w-[150px] flex-shrink-0">
                            <SelectDropdown
                                label={searchBy}
                                options={searchByOptions}
                                value={searchBy}
                                onChange={setSearchBy}
                                className="w-full h-10"
                            />
                        </div>

                        <div className="w-full md:w-[120px] flex-shrink-0">
                            <SelectDropdown
                                label={sortBy}
                                options={sortByOptions}
                                value={sortBy}
                                onChange={setSortBy}
                                className="w-full h-10"
                            />
                        </div>
                    </div>
                </div>
                {/* AKHIR TOOLBAR */}

                {/* 3. List Content */}
                <div className="space-y-3">
                    {filteredBooks.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            {searchTerm ||
                            searchBy !== "Judul" ||
                            sortBy !== "Terbaru"
                                ? "Data pengajuan tidak ditemukan dengan kriteria tersebut."
                                : "Belum ada pengajuan penghargaan yang masuk."}
                        </div>
                    )}

                    {filteredBooks.map((item) => (
                        <BukuItemMini
                            key={item.id}
                            id={item.id}
                            judul={item.judul}
                            penulis={item.penulis}
                            status={item.status_label || item.status}
                            tanggal={item.tanggal_pengajuan || item.created_at}
                            // Memanggil fungsi yang sudah diperbaiki
                            onClick={handleBukuClick}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
