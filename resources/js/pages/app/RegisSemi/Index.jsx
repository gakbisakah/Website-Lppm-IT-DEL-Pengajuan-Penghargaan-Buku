import { Button } from "@/components/ui/button";
//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppLayout from "@/layouts/app-layout";
import * as Icon from "@tabler/icons-react";
import { ChevronDown, Plus, Search } from "lucide-react";
import * as React from "react";
import { router, Head } from "@inertiajs/react";
import { route } from "ziggy-js";

// --- Komponen BukuItem Ringkas (Tidak Berubah) ---
const BukuItem = ({ id, judul, penulis, status, tanggal, onClick }) => {
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
                {/* Ikon Segitiga (Theme-aware) */}
                <div className="mr-4 flex items-center justify-center w-8 h-8 rounded-full bg-primary flex-shrink-0">
                    <Icon.IconTriangle
                        size={16}
                        className="text-primary-foreground"
                        fill="currentColor"
                    />
                </div>

                {/* Detail Buku */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="font-medium text-base truncate text-foreground">
                        {judul}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                        {penulis}
                    </div>
                </div>

                {/* Status dan Tanggal */}
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

// --- Dropdown/Select Komponen Reusable (Tidak Berubah) ---
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

// [INTEGRASI DATA] Menerima props 'submissions' dari Controller
export default function Index({ submissions = [] }) {
    const [search, setSearch] = React.useState("");
    const [searchBy, setSearchBy] = React.useState("Search by");
    const [sortBy, setSortBy] = React.useState("Sort by");

    // [INTEGRASI NAVIGASI] Mengarahkan ke detail asli
    const handleBukuClick = (id) => {
        router.visit(route("regis-semi.show", id));
    };

    // [INTEGRASI NAVIGASI] Mengarahkan ke halaman pengajuan baru (asumsi rute 'regis-semi.create' untuk pengajuan baru)
    const handleAjukanBukuClick = () => {
        // Asumsi rute untuk pengajuan baru
        router.visit(route("app.penghargaan.buku.create"));
    };

    // Data dropdown
    const searchByOptions = ["Judul", "Dosen"];
    const sortByOptions = ["Terbaru", "Judul"];

    // Filtered data (Logic tidak berubah)
    const filteredSubmissions = submissions
        .filter((item) => {
            const searchTerm = search.toLowerCase();
            if (!searchTerm) return true;

            const targetField =
                searchBy === "Dosen" ? item.nama_dosen : item.judul;

            return targetField.toLowerCase().includes(searchTerm);
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
        <AppLayout>
            <Head title="Buku" />

            {/* 🔥 PERBAIKAN DI SINI: Hapus max-w-6xl dan mx-auto */}
            <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 py-6">
                {/* 1. Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Buku
                        </h1>
                        <p className="text-muted-foreground">
                            Daftar ajuan penghargaan buku yang perlu
                            diverifikasi.
                        </p>
                    </div>
                    {/* Tombol Ajukan */}
                    <div className="mt-0">
                        <Button
                            variant="default"
                            className="w-full md:w-auto"
                            onClick={handleAjukanBukuClick}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajukan Buku Baru
                        </Button>
                    </div>
                </div>

                {/* 2. Toolbar: Search & Sort */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
                    {/* Search Input Group */}
                    <div className="flex-1 flex gap-2">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari judul, penulis..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full h-10 border border-input rounded-md bg-background focus:outline-none placeholder:text-muted-foreground text-sm p-2"
                            />
                        </div>
                        {/* Tombol Cari */}
                        <Button
                            variant="secondary"
                            className="h-10 px-4 rounded-md border border-input shadow-none font-normal text-sm flex-shrink-0"
                        >
                            Search
                        </Button>
                    </div>

                    {/* Dropdowns */}
                    <div className="flex gap-4">
                        <div className="w-full md:w-[150px] flex-shrink-0">
                            <SelectDropdown
                                label={searchBy}
                                value={searchBy}
                                options={searchByOptions}
                                className="w-full h-10"
                                onChange={setSearchBy}
                            />
                        </div>

                        <div className="w-full md:w-[120px] flex-shrink-0">
                            <SelectDropdown
                                label={sortBy}
                                value={sortBy}
                                options={sortByOptions}
                                className="w-full h-10"
                                onChange={setSortBy}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Content (List Buku) */}
                <div className="space-y-3">
                    {filteredSubmissions.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            {search ||
                            searchBy !== "Search by" ||
                            sortBy !== "Sort by"
                                ? "Data pengajuan tidak ditemukan dengan kriteria tersebut."
                                : "Belum ada pengajuan penghargaan yang masuk."}
                        </div>
                    )}

                    {filteredSubmissions.map((item) => (
                        <BukuItem
                            key={item.id}
                            id={item.id}
                            judul={item.judul}
                            penulis={item.nama_dosen}
                            status={item.status_label}
                            tanggal={item.tanggal_pengajuan}
                            onClick={handleBukuClick}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
