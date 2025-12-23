import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import ChangeDialog from "../HakAkses/Dialogs/change-dialog";
import DeleteDialog from "../HakAkses/Dialogs/delete-dialog";

export default function HakAksesPage({ aksesList }) {
    const [openChange, setOpenChange] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    const handleEdit = (item) => {
        setSelectedData(item);
        setOpenChange(true);
    };

    const handleDelete = (item) => {
        setSelectedData(item);
        setOpenDelete(true);
    };

    const handleAdd = () => {
        setSelectedData(null); // Mode tambah
        setOpenChange(true);
    };

    return (
        <AppLayout>
            <Head title="Manajemen Hak Akses" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Hak Akses Pengguna
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola izin akses untuk dosen, mahasiswa, dan admin.
                        </p>
                    </div>
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Akses
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pengguna</CardTitle>
                        <CardDescription>
                            Total {aksesList.length} pengguna dengan hak akses
                            khusus.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        No
                                    </TableHead>
                                    <TableHead>Nama Pengguna</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Hak Akses</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {aksesList.length > 0 ? (
                                    aksesList.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {item.user
                                                    ? item.user.name
                                                    : "User tidak ditemukan"}
                                            </TableCell>
                                            <TableCell>
                                                {item.user
                                                    ? item.user.email
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">
                                                    {item.data_akses.map(
                                                        (akses, i) => (
                                                            <Badge
                                                                key={i}
                                                                variant="secondary"
                                                            >
                                                                {akses}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4 text-orange-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(item)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center h-24 text-muted-foreground"
                                        >
                                            Belum ada data hak akses.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Dialogs */}
                <ChangeDialog
                    open={openChange}
                    onOpenChange={setOpenChange}
                    data={selectedData}
                />

                <DeleteDialog
                    open={openDelete}
                    onOpenChange={setOpenDelete}
                    data={selectedData}
                />
            </div>
        </AppLayout>
    );
}
