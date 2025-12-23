import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppLayout from "@/layouts/app-layout";
import * as Icon from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { router, Head } from "@inertiajs/react"; // Menambahkan Head untuk judul halaman

const BukuItem = ({ id, judul, penulis, status, tanggal, onClick }) => {
    // --- Perbaikan Warna Status ---
    const statusColor =
        status.includes("Disetujui") || status.includes("Selesai")
            ? "text-primary" // Warna tema primer untuk status sukses
            : status.includes("Ditolak/Revisi")
            ? "text-destructive" // Warna tema destruktif untuk status tolak/revisi
            : "text-gray-500"; // Warna netral untuk status lainnya (Draft/Pending)

    return (
        <div
            className="bg-white rounded-lg shadow-md mb-2 cursor-pointer hover:shadow-lg transition-shadow border border-input/20" // Tambah border input tipis
            onClick={() => onClick(id)}
        >
            <div className="flex items-stretch p-4">
                {/* Ikon Segitiga Putih dalam Lingkaran Hitam */}
                {/* UBAH: bg-black -> bg-primary, fill="white" -> text-primary-foreground */}
                <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-primary flex-shrink-0">
                    <Icon.IconTriangle
                        size={20}
                        className="text-primary-foreground"
                        fill="currentColor"
                    />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="font-semibold text-lg truncate">
                        {judul}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                        {penulis}
                    </div>
                </div>

                <div className="text-right ml-4 flex flex-col justify-between h-full">
                    <div className="text-gray-500 text-sm">
                        Status :{" "}
                        <span
                            className={`capitalize font-normal ${statusColor}`}
                        >
                            {status}
                        </span>
                    </div>
                    <div className="text-gray-500 text-xs">{tanggal}</div>
                </div>
            </div>
        </div>
    );
};

const SelectDropdown = ({
    label,
    options,
    className = "",
    onChange,
    value,
}) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            {/* UBAH: border-gray-300 -> border-input, bg-white -> bg-background, text-sm -> text-foreground */}
            <div
                className={`flex items-center justify-between border border-input rounded-md bg-background text-sm px-3 h-10 cursor-pointer ${className}`}
            >
                {label}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
            {options.map((option) => (
                <DropdownMenuItem
                    key={option}
                    onSelect={() => onChange(option)}
                    // TAMBAH: Logic untuk highlight item yang dipilih (theme-aware)
                    className={value === option ? "bg-accent font-medium" : ""}
                >
                    {option}
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
);

export default function Indexx({ submissions = [] }) {
    const [search, setSearch] = React.useState("");
    const [searchBy, setSearchBy] = React.useState("Search by");
    const [sortBy, setSortBy] = React.useState("Sort by");

    const handleBukuClick = (id) => {
        router.visit(route("regis-semi.show.staff", id));
    };

    // Data dropdown
    const searchByOptions = ["Judul", "Dosen"];
    const sortByOptions = ["Terbaru", "Judul"];

    // Filtered data (Logic tidak berubah)
    const filteredSubmissions = submissions
        .filter((item) => {
            const searchTerm = search.toLowerCase();
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
            <Head title="List Pengajuan Buku (Staff)" />
            <Card className="h-full border-none shadow-none">
                <CardHeader className="p-0 px-4 space-y-4">
                    <CardTitle className="text-2xl font-normal pt-4">
                        Buku
                    </CardTitle>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-center">
                        {/* SEARCH INPUT GROUP */}
                        {/* UBAH: border-gray-300 -> border-input */}
                        <div className="flex-1 flex border border-input rounded-md overflow-hidden h-10 w-full bg-background">
                            <input
                                type="text"
                                placeholder="Cari judul atau nama dosen..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 p-2 focus:outline-none placeholder:text-gray-400 text-sm border-none bg-transparent"
                            />
                            <Button
                                // UBAH: Gunakan variant secondary (theme-aware)
                                variant="secondary"
                                className="h-full px-4 rounded-l-none border-l border-input shadow-none font-normal text-sm"
                            >
                                Search
                            </Button>
                        </div>

                        {/* SEARCH BY DROPDOWN */}
                        <div className="w-full md:w-[150px]">
                            <SelectDropdown
                                label={searchBy}
                                value={searchBy} // Tambahkan value untuk highlight
                                options={searchByOptions}
                                className="w-full h-10"
                                onChange={setSearchBy}
                            />
                        </div>

                        {/* SORT BY DROPDOWN */}
                        <div className="w-full md:w-[120px]">
                            <SelectDropdown
                                label={sortBy}
                                value={sortBy} // Tambahkan value untuk highlight
                                options={sortByOptions}
                                className="w-full h-10"
                                onChange={setSortBy}
                            />
                        </div>
                    </div>
                    <hr className="mt-4 mb-0 border-input" />{" "}
                    {/* UBAH: Hapus class hardcoded (mb-0, border-gray-200) */}
                </CardHeader>

                <CardContent className="p-0 px-4 pt-4">
                    <div className="space-y-3">
                        {filteredSubmissions.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                {search ||
                                searchBy !== "Search by" ||
                                sortBy !== "Sort by"
                                    ? "Data pengajuan tidak ditemukan dengan kriteria tersebut."
                                    : "Belum ada pengajuan penghargaan buku yang masuk."}
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
                </CardContent>
            </Card>
        </AppLayout>
    );
}
