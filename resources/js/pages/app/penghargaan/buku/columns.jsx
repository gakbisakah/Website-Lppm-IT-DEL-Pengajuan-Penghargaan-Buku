import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns = [
    {
        header: "No",
        cell: (info) => info.row.index + 1,
        meta: {
            className: "w-[50px]",
        },
    },
    {
        accessorKey: "judul",
        header: "Judul Buku",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.judul}</span>
        ),
    },
    {
        accessorKey: "penulis",
        header: "Penulis",
    },
    {
        accessorKey: "penerbit",
        header: "Penerbit",
    },
    {
        accessorKey: "tahun",
        header: "Tahun",
    },
    {
        accessorKey: "isbn",
        header: "ISBN",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            let variant = "outline"; // Default: neutral/outline

            // MENGUBAH HARDCODED COLORS KE VARIAN TEMA SHADCN
            if (status === "disetujui") {
                // Menggunakan 'default' untuk merepresentasikan status sukses/disetujui (primary color)
                variant = "default";
            } else if (status === "diajukan") {
                // Menggunakan 'secondary' untuk merepresentasikan status pending/submitted
                variant = "secondary";
            } else if (status === "ditolak") {
                // Menggunakan 'destructive' untuk status penolakan
                variant = "destructive";
            }

            // Menghapus hardcoded class 'color' dan menggantinya dengan 'variant'
            return (
                <Badge variant={variant} className="capitalize">
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: "Aksi",
        // FIX: Menghapus parameter { row } yang tidak terpakai
        cell: () => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {/* UBAH: text-red-600 -> text-destructive (theme-aware) */}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
