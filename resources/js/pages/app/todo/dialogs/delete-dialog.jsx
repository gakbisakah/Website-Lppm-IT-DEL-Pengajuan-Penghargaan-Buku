import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "@inertiajs/react";
import { Separator } from "@radix-ui/react-separator";
import { AlertCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

/**
 * Komponen Dialog untuk menghapus data Todo
 *
 * @param {Object} props - Props komponen
 * @param {Object} props.dataDelete - Data todo yang akan dihapus
 * @param {boolean} props.openDialog - Status buka/tutup dialog
 * @param {Function} props.setOpenDialog - Fungsi untuk mengontrol buka/tutup dialog
 */
export function TodoDeleteDialog({ dataDelete, openDialog, setOpenDialog }) {
    // ============================ STATE & FORM MANAGEMENT ============================

    // Inisialisasi form menggunakan useForm dari Inertia
    const { data, setData, post, processing } = useForm({
        todoIds: [],
        confirmation: "",
    });

    // State untuk kunci konfirmasi penghapusan
    const [keyConfirmation, setKeyConfirmation] = useState("");

    // ============================ EFFECTS ============================

    /**
     * Effect untuk generate kunci konfirmasi ketika dataDelete berubah
     * - Generate random string sebagai kunci konfirmasi
     * - Reset kunci jika tidak ada data yang akan dihapus
     */
    useEffect(() => {
        if (dataDelete && dataDelete.todoIds) {
            // Generate kunci konfirmasi acak (6 karakter)
            const randomKey = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();
            setKeyConfirmation(randomKey);
        } else {
            setKeyConfirmation("");
        }
    }, [dataDelete]);

    /**
     * Effect untuk mengatur data todoIds yang akan dihapus
     * - Set data todoIds ke form
     * - Tutup dialog jika tidak ada data yang valid
     */
    useEffect(() => {
        if (dataDelete && dataDelete.todoIds) {
            setData("todoIds", dataDelete.todoIds || []);
        } else {
            setOpenDialog(false);
        }
    }, [dataDelete, setData, setOpenDialog]);

    // ============================ FUNCTIONS ============================

    /**
     * Handle submit form penghapusan
     * - Validasi kunci konfirmasi
     * - Kirim request penghapusan jika valid
     */
    const handleSubmit = () => {
        // Validasi kunci konfirmasi
        if (data.confirmation !== keyConfirmation) {
            toast.error("Konfirmasi kunci tidak sesuai.");
            return;
        }

        // Kirim request penghapusan
        post(route("todo.delete-post"), data);
    };

    // ============================ RENDER ============================

    return (
        <>
            <Sheet open={openDialog} onOpenChange={setOpenDialog}>
                <SheetContent aria-describedby="form-dialog">
                    {/* Header Dialog */}
                    <SheetHeader className="pb-0">
                        <SheetTitle>Hapus Todo</SheetTitle>
                        <SheetDescription>
                            Tindakan ini akan menghapus todo yang dipilih.
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="border-b" />

                    {/* Konten Dialog */}
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        {/* Alert Peringatan */}
                        <div className="grid gap-3">
                            <Alert variant="destructive">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>Peringatan</AlertTitle>
                                <AlertDescription>
                                    <p className="mb-2">
                                        Dengan menghapus todo, membuat todo ini
                                        tidak lagi dapat diakses atau digunakan
                                        dalam aplikasi, kecuali todo tersebut
                                        dibuat kembali. Daftar todo yang akan
                                        dihapus:
                                    </p>
                                    {/* Daftar todo yang akan dihapus */}
                                    <ul className="list-inside list-disc text-sm space-y-1">
                                        {dataDelete && dataDelete.dataList
                                            ? dataDelete.dataList.map(
                                                  (dataList) => (
                                                      <li
                                                          key={`delete-${dataList.id}`}
                                                          className="text-destructive-foreground"
                                                      >
                                                          {dataList.title}
                                                      </li>
                                                  )
                                              )
                                            : null}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        </div>

                        {/* Kunci Konfirmasi (Read-only) */}
                        <div className="grid gap-3">
                            <Label htmlFor="keyConfirmation">
                                Kunci untuk menghapus
                            </Label>
                            <Input
                                id="keyConfirmation"
                                value={keyConfirmation}
                                readOnly={true}
                                disabled={true}
                                placeholder="Menghasilkan kunci..."
                                className="font-mono text-center"
                            />
                        </div>

                        {/* Input Konfirmasi Pengguna */}
                        <div className="grid gap-3">
                            <Label htmlFor="userConfirmation">
                                Tulis ulang kunci di atas
                            </Label>
                            <Input
                                id="userConfirmation"
                                value={data.confirmation}
                                onChange={(e) =>
                                    setData("confirmation", e.target.value)
                                }
                                placeholder="Ketik kunci di sini..."
                                className="font-mono text-center uppercase"
                            />
                        </div>
                    </div>

                    {/* Footer Dialog - Tombol Aksi */}
                    <SheetFooter className="flex gap-2">
                        {/* Tombol Hapus */}
                        <Button
                            onClick={handleSubmit}
                            type="button"
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500 min-w-24"
                            disabled={processing || !data.confirmation}
                        >
                            {processing ? "Menghapus..." : "Tetap Hapus"}
                        </Button>

                        {/* Tombol Batal */}
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                type="button"
                                disabled={processing}
                            >
                                Batal
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}