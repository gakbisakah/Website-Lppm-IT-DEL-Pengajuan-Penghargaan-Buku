import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { SelectValue } from "@radix-ui/react-select";
import { Separator } from "@radix-ui/react-separator";
import { useEffect } from "react";
import { route } from "ziggy-js";

/**
 * Komponen Dialog untuk menambah atau mengubah data Todo
 *
 * @param {Object} props - Props komponen
 * @param {Object} props.dataEdit - Data todo yang akan diedit (null untuk tambah baru)
 * @param {string} props.dialogTitle - Judul dialog
 * @param {boolean} props.openDialog - Status buka/tutup dialog
 * @param {Function} props.setOpenDialog - Fungsi untuk mengontrol buka/tutup dialog
 */
export function TodoChangeDialog({
    dataEdit,
    dialogTitle,
    openDialog,
    setOpenDialog,
}) {
    // ============================ FORM MANAGEMENT ============================

    // Inisialisasi form menggunakan useForm dari Inertia
    const { data, setData, post, processing, errors } = useForm({
        todoId: "",
        title: "",
        description: "",
        isDone: false,
    });

    // ============================ EFFECTS ============================

    /**
     * Effect untuk mengisi form ketika dataEdit berubah
     * - Jika ada dataEdit: isi form dengan data yang akan diedit
     * - Jika tidak: reset form untuk tambah data baru
     */
    useEffect(() => {
        if (dataEdit && dataEdit.todoId) {
            // Mode edit: isi form dengan data yang ada
            setData("todoId", dataEdit.todoId || "");
            setData("title", dataEdit.title || "");
            setData("description", dataEdit.description || "");
            setData("isDone", dataEdit.isDone || false);
        } else {
            // Mode tambah: reset form
            setData("todoId", "");
            setData("title", "");
            setData("description", "");
            setData("isDone", false);
        }
    }, [dataEdit]);

    // ============================ FUNCTIONS ============================

    /**
     * Handle submit form
     * Mengirim data form ke endpoint todo.change-post
     */
    const handleSubmit = () => {
        post(route("todo.change-post"), data);
    };

    // ============================ RENDER ============================

    return (
        <>
            <Sheet open={openDialog} onOpenChange={setOpenDialog}>
                <SheetContent aria-describedby="form-dialog">
                    {/* Header Dialog */}
                    <SheetHeader className="pb-0">
                        <SheetTitle>{dialogTitle}</SheetTitle>
                        <SheetDescription>
                            Silahkan isi data todo pada form di bawah ini.
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="border-b" />

                    {/* Form Input */}
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        {/* Input Judul */}
                        <div className="grid gap-3">
                            <Label htmlFor="inputTitle">Judul</Label>
                            <Input
                                id="inputTitle"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                placeholder="Masukkan judul todo..."
                            />
                            {/* Tampilkan error validation jika ada */}
                            {errors.title && (
                                <p className="text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Input Deskripsi */}
                        <div className="grid gap-3">
                            <Label htmlFor="inputDescription">Deskripsi</Label>
                            <Textarea
                                id="inputDescription"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                placeholder="Masukkan deskripsi todo..."
                                rows={4}
                            />
                            {/* Tampilkan error validation jika ada */}
                            {errors.description && (
                                <p className="text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Input Status Selesai (hanya tampil saat edit) */}
                        {dataEdit && dataEdit.todoId ? (
                            <div className="grid gap-3">
                                <Label htmlFor="selectIsDone">
                                    Status Selesai
                                </Label>
                                <Select
                                    id="selectIsDone"
                                    value={data.isDone.toString()}
                                    onValueChange={(value) =>
                                        setData("isDone", value === "true")
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="false">
                                                Belum Selesai
                                            </SelectItem>
                                            <SelectItem value="true">
                                                Selesai
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {/* Tampilkan error validation jika ada */}
                                {errors.isDone && (
                                    <p className="text-sm text-red-600">
                                        {errors.isDone}
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Dialog - Tombol Aksi */}
                    <SheetFooter>
                        {/* Tombol Simpan */}
                        <Button
                            onClick={handleSubmit}
                            type="button"
                            disabled={processing}
                            className="min-w-20"
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
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