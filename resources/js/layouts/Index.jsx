import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { CreateDialog } from "./Dialogs/CreateDialog";
import { EditDialog } from "./Dialogs/EditDialog";
import { DeleteDialog } from "./Dialogs/DeleteDialog";

export default function Index() {
    const { seminars, flash } = usePage().props;
    const [selected, setSelected] = useState([]);

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelected(seminars.map((seminar) => seminar.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((item) => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleDeleteSelected = () => {
        if (selected.length === 0) {
            toast.error("Tidak ada data yang dipilih.");
            return;
        }

        router.post(
            route("regis-semi.delete-selected"),
            { ids: selected },
            {
                onSuccess: () => {
                    toast.success(flash.message);
                    setSelected([]);
                },
                onError: (errors) => {
                    toast.error(
                        errors.message || "Terjadi kesalahan saat menghapus data."
                    );
                },
            }
        );
    };

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Data Registrasi Seminar</CardTitle>
                        <div className="flex items-center gap-2">
                            {selected.length > 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteSelected}
                                >
                                    Hapus Terpilih
                                </Button>
                            )}
                            <CreateDialog />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={
                                            selected.length ===
                                                seminars.length &&
                                            seminars.length > 0
                                        }
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Nama Seminar</TableHead>
                                <TableHead>Penyelenggara</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead className="w-[100px] text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {seminars.length > 0 ? (
                                seminars.map((seminar) => (
                                    <TableRow key={seminar.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selected.includes(
                                                    seminar.id
                                                )}
                                                onCheckedChange={() =>
                                                    handleSelect(seminar.id)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {seminar.nama_seminar}
                                        </TableCell>
                                        <TableCell>
                                            {seminar.penyelenggara}
                                        </TableCell>
                                        <TableCell>
                                            {seminar.tanggal_seminar}
                                        </TableCell>
                                        <TableCell>{seminar.lokasi}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <EditDialog data={seminar} />
                                                <DeleteDialog
                                                    id={seminar.id}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        Tidak ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}