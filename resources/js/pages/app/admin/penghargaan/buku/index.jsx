import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Calendar, User, Eye } from "lucide-react";
import { route } from "ziggy-js"; // Tambahkan import route dari ziggy-js

export default function AdminBukuIndex({ submissions, filters }) {
    const breadcrumbs = [
        { title: "Admin", url: "#" },
        { title: "Penghargaan", url: "#" },
        { title: "Buku Masuk", url: "#" },
    ];

    const [search, setSearch] = useState(filters.search || ""); // Handle search dengan debounce sederhana atau enter

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route("admin.penghargaan.buku.index"),
            { search },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
                        <Head title="Daftar Penghargaan Buku Masuk" />         
             {" "}
            <div className="space-y-6">
                                {/* Header Section */}               {" "}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                       {" "}
                    <div>
                                               {" "}
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                                        Penghargaan Buku Masuk  
                                                 {" "}
                        </h1>
                                               {" "}
                        <p className="text-muted-foreground">
                                                        Daftar ajuan buku dari
                            dosen yang perlu                            
                            diverifikasi.                        {" "}
                        </p>
                                           {" "}
                    </div>
                                        {/* Search Bar (Diperbaiki) */}         
                             {" "}
                    <form
                        onSubmit={handleSearch}
                        className="flex w-full md:w-auto items-center gap-2"
                    >
                                               {" "}
                        <div className="relative w-full md:w-64">
                                                       {" "}
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                       {" "}
                            <Input
                                type="search"
                                placeholder="Cari judul atau ISBN..." // FIX: Gunakan kelas semantik
                                className="pl-8 bg-background border-input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                                                   {" "}
                        </div>
                                               {" "}
                        <Button type="submit" variant="secondary">
                                                        Cari                    
                               {" "}
                        </Button>
                                           {" "}
                    </form>
                                   {" "}
                </div>
                                {/* Content Section: Grid Card */}             
                 {" "}
                {submissions.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed border-border">
                                               {" "}
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                               {" "}
                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                                                        Tidak ada pengajuan baru
                                                   {" "}
                        </h3>
                                               {" "}
                        <p className="text-muted-foreground">
                                                        Belum ada data buku yang
                            masuk saat ini.                        {" "}
                        </p>
                                           {" "}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                               {" "}
                        {submissions.map((item) => (
                            <Card
                                key={item.id}
                                className="flex flex-col h-full hover:shadow-md transition-shadow"
                            >
                                                               {" "}
                                <CardHeader className="pb-3">
                                                                       {" "}
                                    <div className="flex justify-between items-start gap-2">
                                                                               {" "}
                                        <Badge
                                            variant="outline"
                                            className={item.status_color}
                                        >
                                                                               
                                                    {item.status_label}         
                                                                         {" "}
                                        </Badge>
                                                                               {" "}
                                        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                                                                               
                                                   {" "}
                                            <Calendar className="h-3 w-3" />   
                                                                               
                                                {item.tanggal_masuk}           
                                                                       {" "}
                                        </span>
                                                                           {" "}
                                    </div>
                                                                       {" "}
                                    <CardTitle className="leading-snug line-clamp-2 min-h-[3rem] mt-2 text-foreground">
                                                                               {" "}
                                        {item.judul}                           
                                               {" "}
                                    </CardTitle>
                                                                       {" "}
                                    <CardDescription className="flex items-center gap-1">
                                                                               
                                        ISBN: {item.isbn}                       
                                                   {" "}
                                    </CardDescription>
                                                                   {" "}
                                </CardHeader>
                                                               {" "}
                                <CardContent className="flex-grow space-y-3">
                                                                       {" "}
                                    <div className="text-sm text-muted-foreground space-y-1">
                                                                               {" "}
                                        <div className="flex items-start gap-2">
                                                                               
                                                   {" "}
                                            <User className="h-4 w-4 mt-0.5 text-primary" />
                                                                               
                                                   {" "}
                                            <div>
                                                                               
                                                               {" "}
                                                <span className="font-medium text-foreground block">
                                                                               
                                                                           
                                                    Pengusul:                  
                                                                               
                                                     {" "}
                                                </span>
                                                                               
                                                                {item.pengusul} 
                                                                               
                                                         {" "}
                                            </div>
                                                                               
                                               {" "}
                                        </div>
                                                                               {" "}
                                        <div className="flex items-start gap-2">
                                                                               
                                                   {" "}
                                            <BookOpen className="h-4 w-4 mt-0.5 text-primary" />
                                                                               
                                                   {" "}
                                            <div>
                                                                               
                                                               {" "}
                                                <span className="font-medium text-foreground block">
                                                                               
                                                                           
                                                    Penulis:                    
                                                                               {" "}
                                                </span>
                                                                               
                                                               {" "}
                                                {item.penulis_display}         
                                                                               
                                                 {" "}
                                            </div>
                                                                               
                                               {" "}
                                        </div>
                                                                           {" "}
                                    </div>
                                                                   {" "}
                                </CardContent>
                                                               {" "}
                                <CardFooter className="pt-2">
                                                                       {" "}
                                    <Link
                                        href={route(
                                            "admin.penghargaan.buku.show",
                                            item.id
                                        )}
                                        className="w-full"
                                    >
                                                                               {" "}
                                        <Button
                                            variant="default" // FIX: Gunakan variant default untuk warna tema
                                            className="w-full"
                                        >
                                                                               
                                                   {" "}
                                            <Eye className="mr-2 h-4 w-4" />   
                                                                               
                                                Lihat & Verifikasi              
                                                                     {" "}
                                        </Button>
                                                                           {" "}
                                    </Link>
                                                                   {" "}
                                </CardFooter>
                                                           {" "}
                            </Card>
                        ))}
                                           {" "}
                    </div>
                )}
                           {" "}
            </div>
                   {" "}
        </AppLayout>
    );
}
