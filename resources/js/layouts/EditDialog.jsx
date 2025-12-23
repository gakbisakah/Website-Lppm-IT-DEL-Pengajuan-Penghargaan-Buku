import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { IconEdit } from "@tabler/icons-react";

export function EditDialog({ data: seminarData }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        id: seminarData.id,
        nama_seminar: seminarData.nama_seminar,
        penyelenggara: seminarData.penyelenggara,
        tanggal_seminar: seminarData.tanggal_seminar,
        lokasi: seminarData.lokasi,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("regis-semi.change"), {
            onSuccess: () => {
                toast.success("Data berhasil diubah.");
                setOpen(false);
            },
            onError: (error) => {
                toast.error(
                    error.message || "Terjadi kesalahan saat mengubah data."
                );
            },
        });
    };

    useEffect(() => {
        if (!open) {
            reset();
        } else {
            setData({
                id: seminarData.id,
                nama_seminar: seminarData.nama_seminar,
                penyelenggara: seminarData.penyelenggara,
                tanggal_seminar: seminarData.tanggal_seminar,
                lokasi: seminarData.lokasi,
            });
        }
    }, [open, seminarData]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <IconEdit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ubah Registrasi Seminar</DialogTitle>
                    <DialogDescription>
                        Ubah data registrasi seminar yang sudah ada.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nama_seminar" className="text-right">Nama Seminar</Label>
                            <Input id="nama_seminar" value={data.nama_seminar} onChange={(e) => setData("nama_seminar", e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="penyelenggara" className="text-right">Penyelenggara</Label>
                            <Input id="penyelenggara" value={data.penyelenggara} onChange={(e) => setData("penyelenggara", e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tanggal_seminar" className="text-right">Tanggal</Label>
                            <Input id="tanggal_seminar" type="date" value={data.tanggal_seminar} onChange={(e) => setData("tanggal_seminar", e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lokasi" className="text-right">Lokasi</Label>
                            <Input id="lokasi" value={data.lokasi} onChange={(e) => setData("lokasi", e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}