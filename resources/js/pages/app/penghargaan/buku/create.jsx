import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"; // Import icon Alert
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import component Alert
import { route } from "ziggy-js";

export default function CreateBukuPage() {
    const breadcrumbs = [
        { title: "Penghargaan", url: "#" },
        { title: "Buku", url: route("app.penghargaan.buku.index") },
        { title: "Ajukan", url: "#" },
    ];

    const { data, setData, post, processing, errors } = useForm({
        judul: "",
        penulis: "",
        penerbit: "",
        level_penerbit: "",
        tahun: new Date().getFullYear(),
        isbn: "",
        kategori: "",
        jumlah_halaman: "",
        bidang_keilmuan: "",
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route("app.penghargaan.buku.store"));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Formulir Pengajuan Buku" />

            <div className="max-w-2xl mx-auto w-full space-y-6">
                <div className="flex items-center">
                    <Link href={route("app.penghargaan.buku.index")}>
                        <Button
                            // UBAH: Menghapus hardcoded color class, biarkan variant secondary
                            variant="secondary"
                            size="sm"
                            className="gap-2 font-semibold"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </Button>
                    </Link>
                </div>

                {/* [BARU] MENAMPILKAN ERROR SISTEM / DATABASE */}
                {errors.error && (
                    <Alert
                        variant="destructive"
                        // UBAH: Hapus hardcoded red class, biarkan variant="destructive" yang mengaturnya
                    >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Gagal Menyimpan!</AlertTitle>
                        <AlertDescription>{errors.error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Formulir Pengajuan Penghargaan Buku
                        </CardTitle>
                        <CardDescription>
                            Lengkapi data buku secara detail sesuai dengan fisik
                            buku.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {/* Judul Buku */}
                            <div className="space-y-2">
                                <Label htmlFor="judul">
                                    Judul Buku{" "}
                                    <span className="text-destructive">*</span>{" "}
                                    {/* UBAH: text-red-500 -> text-destructive */}
                                </Label>
                                <Input
                                    id="judul"
                                    placeholder="Masukkan judul lengkap buku"
                                    value={data.judul}
                                    onChange={(e) =>
                                        setData("judul", e.target.value)
                                    }
                                />
                                {errors.judul && (
                                    <p className="text-sm text-destructive">
                                        {" "}
                                        {/* UBAH: text-red-500 -> text-destructive */}
                                        {errors.judul}
                                    </p>
                                )}
                            </div>

                            {/* Penulis */}
                            <div className="space-y-2">
                                <Label htmlFor="penulis">
                                    Penulis (Tim){" "}
                                    <span className="text-destructive">*</span>{" "}
                                    {/* UBAH: text-red-500 -> text-destructive */}
                                </Label>
                                <Input
                                    id="penulis"
                                    placeholder="Contoh: Budi Santoso, Siti Aminah"
                                    value={data.penulis}
                                    onChange={(e) =>
                                        setData("penulis", e.target.value)
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Pisahkan nama penulis dengan koma.
                                </p>
                                {errors.penulis && (
                                    <p className="text-sm text-destructive">
                                        {" "}
                                        {/* UBAH: text-red-500 -> text-destructive */}
                                        {errors.penulis}
                                    </p>
                                )}
                            </div>

                            {/* Bidang Keilmuan */}
                            <div className="space-y-2">
                                <Label>Bidang Keilmuan</Label>
                                <Select
                                    value={data.bidang_keilmuan}
                                    onValueChange={(val) =>
                                        setData("bidang_keilmuan", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih bidang keilmuan" />
                                    </SelectTrigger>
                                    <SelectContent>


    


                                        <SelectItem value="Informatika">
    Informatika
</SelectItem>
<SelectItem value="Sistem Informasi">
    Sistem Informasi
</SelectItem>
<SelectItem value="Teknik Elektro">
    Teknik Elektro
</SelectItem>
<SelectItem value="Manajemen Rekayasa">
    Manajemen Rekayasa
</SelectItem>
<SelectItem value="Teknik Metalurgi">
    Teknik Metalurgi
</SelectItem>
<SelectItem value="Teknologi Komputer">
    Teknologi Komputer
</SelectItem>
<SelectItem value="Teknologi Informasi">
    Teknologi Informasi
</SelectItem>
<SelectItem value="Teknologi Rekayasa Perangkat Lunak">
    Teknologi Rekayasa Perangkat Lunak
</SelectItem>
<SelectItem value="Teknik Bioproses">
    Teknik Bioproses
</SelectItem>
<SelectItem value="Bioteknologi">
    Bioteknologi
</SelectItem>
                                        

                                    </SelectContent>
                                </Select>
                                {errors.bidang_keilmuan && (
                                    <p className="text-sm text-destructive">
                                        {" "}
                                        {/* UBAH: text-red-500 -> text-destructive */}
                                        {errors.bidang_keilmuan}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Penerbit */}
                                <div className="space-y-2">
                                    <Label htmlFor="penerbit">Penerbit</Label>
                                    <Input
                                        id="penerbit"
                                        placeholder="Nama penerbit"
                                        value={data.penerbit}
                                        onChange={(e) =>
                                            setData("penerbit", e.target.value)
                                        }
                                    />
                                    {errors.penerbit && (
                                        <p className="text-sm text-destructive">
                                            {" "}
                                            {/* UBAH: text-red-500 -> text-destructive */}
                                            {errors.penerbit}
                                        </p>
                                    )}
                                </div>

                                {/* Level Penerbit */}
                                <div className="space-y-2">
                                    <Label>
                                        Tingkat Penerbit{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>{" "}
                                        {/* UBAH: text-red-500 -> text-destructive */}
                                    </Label>
                                    <Select
                                        value={data.level_penerbit}
                                        onValueChange={(val) =>
                                            setData("level_penerbit", val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tingkat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NATIONAL">
                                                Nasional
                                            </SelectItem>
                                            <SelectItem value="NATIONAL_ACCREDITED">
                                                Nasional Terakreditasi
                                            </SelectItem>
                                            <SelectItem value="INTERNATIONAL">
                                                Internasional
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.level_penerbit && (
                                        <p className="text-sm text-destructive">
                                            {" "}
                                            {/* UBAH: text-red-500 -> text-destructive */}
                                            {errors.level_penerbit}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tahun Terbit */}
                                <div className="space-y-2">
                                    <Label htmlFor="tahun">Tahun Terbit</Label>
                                    <Input
                                        id="tahun"
                                        type="number"
                                        placeholder="2025"
                                        value={data.tahun}
                                        onChange={(e) =>
                                            setData("tahun", e.target.value)
                                        }
                                    />
                                    {errors.tahun && (
                                        <p className="text-sm text-destructive">
                                            {" "}
                                            {/* UBAH: text-red-500 -> text-destructive */}
                                            {errors.tahun}
                                        </p>
                                    )}
                                </div>

                                {/* ISBN */}
                                <div className="space-y-2">
                                    <Label htmlFor="isbn">
                                        ISBN{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>{" "}
                                        {/* UBAH: text-red-500 -> text-destructive */}
                                    </Label>
                                    <Input
                                        id="isbn"
                                        placeholder="Contoh: 978-602-xxxxx"
                                        value={data.isbn}
                                        onChange={(e) =>
                                            setData("isbn", e.target.value)
                                        }
                                    />
                                    {errors.isbn && (
                                        <p className="text-sm text-destructive">
                                            {" "}
                                            {/* UBAH: text-red-500 -> text-destructive */}
                                            {errors.isbn}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Kategori */}
                                <div className="space-y-2">
                                    <Label>Kategori Buku</Label>
                                    <Select
                                        value={data.kategori}
                                        onValueChange={(val) =>
                                            setData("kategori", val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TEACHING">
                                                Buku Ajar
                                            </SelectItem>
                                            <SelectItem value="REFERENCE">
                                                Buku Referensi
                                            </SelectItem>
                                            <SelectItem value="MONOGRAPH">
                                                Monograf
                                            </SelectItem>
                                            <SelectItem value="CHAPTER">
                                                Book Chapter
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.kategori && (
                                        <p className="text-sm text-destructive">
                                            {" "}
                                            {/* UBAH: text-red-500 -> text-destructive */}
                                            {errors.kategori}
                                        </p>
                                    )}
                                </div>

                                {/* Jumlah Halaman */}
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_halaman">
                                        Jumlah Halaman
                                    </Label>
                                    <Input
                                        id="jumlah_halaman"
                                        type="number"
                                        placeholder="Min. 40"
                                        value={data.jumlah_halaman}
                                        onChange={(e) =>
                                            setData(
                                                "jumlah_halaman",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {errors.jumlah_halaman && (
                                        <p className="text-sm text-destructive">
                                            {" "}
                                            {/* UBAH: text-red-500 -> text-destructive */}
                                            {errors.jumlah_halaman}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end bg-muted/10 py-4 gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => window.history.back()}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                // UBAH: hardcoded black/white -> variant="default" (Primary color)
                                variant="default"
                                className="w-full md:w-auto"
                            >
                                {processing ? (
                                    "Menyimpan..."
                                ) : (
                                    <>
                                        Selanjutnya{" "}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
