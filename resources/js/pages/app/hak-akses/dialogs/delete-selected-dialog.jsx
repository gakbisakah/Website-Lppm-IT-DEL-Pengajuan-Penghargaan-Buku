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
export function HakAksesDeleteSelectedDialog({
    dataDelete,
    openDialog,
    setOpenDialog,
}) {
    const { data, setData, post, processing } = useForm({
        userIds: [],
        confirmation: "",
    });

    const [keyConfirmation, setKeyConfirmation] = useState("");

    useEffect(() => {
        if (dataDelete && dataDelete.userIds) {
            setKeyConfirmation(
                Math.random().toString(36).substring(2, 8).toUpperCase()
            );
        } else {
            setKeyConfirmation("");
        }
    }, [dataDelete]);

    useEffect(() => {
        if (dataDelete && dataDelete.userIds) {
            setData("userIds", dataDelete.userIds || []);
        } else {
            setOpenDialog(false);
        }
    }, [dataDelete, setData, setOpenDialog]);

    const handleSubmit = () => {
        if (data.confirmation !== keyConfirmation) {
            toast.error("Konfirmasi kunci tidak sesuai.");
            return;
        }

        post(route("hak-akses.delete-selected-post"), data);
    };
    return (
        <>
            <Sheet open={openDialog} onOpenChange={setOpenDialog}>
                <SheetContent aria-describedby="form-dialog">
                    <SheetHeader className="pb-0">
                        <SheetTitle>Hapus Hak Akses</SheetTitle>
                        <SheetDescription>
                            Tindakan ini akan menghapus hak akses pengguna yang
                            dipilih.
                        </SheetDescription>
                    </SheetHeader>
                    <Separator className="border-b" />
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Alert variant="destructive">
                                <AlertCircleIcon />
                                <AlertTitle>Peringatan</AlertTitle>
                                <AlertDescription>
                                    <p>
                                        Dengan menghapus hak akses pengguna,
                                        membuat pengguna ini tidak lagi dapat
                                        mengakses sistem tertentu pada aplikasi,
                                        kecuali hak akses diberikan kembali.
                                        Daftar pengguna yang akan dihapus hak
                                        aksesnya:
                                    </p>
                                    <ul className="list-inside list-disc text-sm">
                                        {dataDelete && dataDelete.userNames
                                            ? dataDelete.userNames.map(
                                                  (userName) => (
                                                      <li
                                                          key={`delete-${userName}`}
                                                      >
                                                          {userName}
                                                      </li>
                                                  )
                                              )
                                            : null}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        </div>

                        {/* Kode untuk menghapus */}
                        <div className="grid gap-3">
                            <Label>Kunci untuk menghapus</Label>
                            <Input
                                value={keyConfirmation}
                                readOnly={true}
                                disabled={true}
                            />
                        </div>

                        {/* Konfirmasi */}
                        <div className="grid gap-3">
                            <Label>Tulis ulang kunci</Label>
                            <Input
                                value={data.confirmation}
                                onChange={(e) =>
                                    setData("confirmation", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button
                            onClick={handleSubmit}
                            type="button"
                            className="bg-red-600 hover:bg-red-700"
                            disabled={processing}
                        >
                            {processing ? "Menghapus..." : "Tetap Hapus"}
                        </Button>
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
