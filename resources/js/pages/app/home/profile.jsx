import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Head } from "@inertiajs/react";

// Komponen helper untuk baris data
const DataRow = ({ label, value, editable = false }) => (
    <div className="flex justify-between items-center py-4 px-4 border-b border-border">
        <div className="text-muted-foreground font-medium">{label}</div>
        <div className="flex items-center space-x-2">
            <span className="text-foreground">{value || "..."}</span>
            {editable && (
                // Ikon Pensil SVG inline
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                </svg>
            )}
        </div>
    </div>
);

export default function Profile({ user, error }) {
    const userData = user || {};

    const { name, email, NIDN, ProgramStudi, SintaID, ScopusID, photo } =
        userData;

    return (
        <AppLayout>
            <Head title="Profil Pengguna" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Judul Halaman: Pengaturan Akun */}
                    <h1 className="text-lg font-medium text-foreground flex items-center mb-8">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        Pengaturan Akun
                    </h1>

                    {error && (
                        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {/* Bagian Foto Profil */}
                    <div className="flex flex-col items-center mb-10">
                        <p className="text-sm text-muted-foreground mb-4">
                            Add profile picture
                        </p>
                        <div className="relative group">
                            <img
                                src={photo || "/images/default-profile.png"}
                                alt="Foto Profil"
                                className="w-24 h-24 rounded-full object-cover border-2 border-input shadow"
                            />
                            {/* Ikon Pensil di atas foto profil */}
                            <div className="absolute top-0 right-0 p-1 bg-background rounded-full border border-input cursor-pointer shadow-md">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-muted-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Edit user profile
                        </p>
                    </div>

                    {/* Bagian Data Pengguna */}
                    <div className="border border-border rounded-lg bg-card shadow-sm divide-y divide-border">
                        <DataRow label="Nama" value={name} />
                        <DataRow label="Akun Email" value={email} />
                        <DataRow label="NIDN" value={NIDN} />
                        <DataRow label="Program Studi" value={ProgramStudi} />
                        <DataRow
                            label="Sinta ID"
                            value={SintaID}
                            editable={true}
                        />
                        <DataRow
                            label="Scopus ID"
                            value={ScopusID}
                            editable={true}
                        />
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" className="h-10 px-6">
                            Kembali
                        </Button>
                        <Button
                            variant="default"
                            className="h-10 px-6 font-medium shadow-md"
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
