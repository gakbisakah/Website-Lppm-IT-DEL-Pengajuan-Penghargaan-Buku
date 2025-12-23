import AppLayout from "@/layouts/app-layout";
import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";

// Daftar Program Studi yang disediakan pengguna
const PROGRAM_STUDI_OPTIONS = [
    "Informatika",
    "Sistem Informasi",
    "Teknik Elektro",
    "Manajemen Rekayasa",
    "Teknik Metalurgi",
    "Teknologi Komputer",
    "Teknologi Informasi",
    "Teknologi Rekayasa Perangkat Lunak",
    "Teknik Bioproses",
    "Bioteknologi",
];


// --- Komponen Notifikasi Elegan (Dipertahankan) ---
const NotificationCard = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-center p-4">
            <div 
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-xl max-w-sm w-full transition-all duration-300 transform motion-reduce:transition-none"
                role="alert"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold text-sm">{message}</p>
                    </div>
                    <button onClick={onClose} className="text-green-700 hover:text-green-900 focus:outline-none">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
// ---------------------------------------------

// --- Komponen Input Field yang Disempurnakan ---
const ProfileField = ({ label, value, placeholder, onChange, readOnly = false, isSelect = false, options = [] }) => {
    const isEditable = !readOnly;

    return (
        <div className="relative flex items-center bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
            {/* Label di Kiri. Dibuat sedikit lebih lebar (w-44) untuk mengimbangi total lebar container yang sangat besar. */}
            <div className={`flex-shrink-0 w-36 md:w-44 px-4 py-3 ${readOnly ? 'bg-gray-50' : 'bg-gray-100'} border-r border-gray-200 text-sm font-medium text-gray-700`}>
                {label}
            </div>

            {/* Konten (Input, Select, atau Tampilan) di Kanan */}
            <div className="flex-grow min-w-0">
                {isEditable ? (
                    isSelect ? (
                        // SELECT DROPDOWN
                        <select
                            value={value}
                            onChange={onChange}
                            // appearance-none dan class border-none penting untuk styling yang konsisten
                            className="w-full px-4 py-3 border-none focus:ring-0 focus:outline-none text-base text-gray-900 appearance-none" 
                        >
                            <option value="" disabled>{placeholder || `Pilih ${label}`}</option>
                            {options.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    ) : (
                        // INPUT TEXT
                        <input
                            type="text"
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder || `Masukkan ${label}`}
                            className="w-full px-4 py-3 border-none focus:ring-0 focus:outline-none text-base text-gray-900"
                        />
                    )
                ) : (
                    // Teks hanya baca
                    <p className="w-full px-4 py-3 text-base text-gray-900 font-medium truncate">
                        {value || <span className="text-gray-400 italic">Belum diatur</span>}
                    </p>
                )}
            </div>

            {/* Ikon Edit / Dropdown Arrow */}
            {isEditable && (
                <div className="flex-shrink-0 pr-4 pointer-events-none">
                    {isSelect ? (
                        // Arrow untuk Select
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    ) : (
                        // Ikon pensil untuk Input
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    )}
                </div>
            )}
        </div>
    );
};
// -------------------------------------------------------------------

export default function Profile({ user }) {
    const { flash } = usePage().props;

    const [notificationMessage, setNotificationMessage] = useState(flash.success || null);

    useEffect(() => {
        if (flash.success) {
            setNotificationMessage(flash.success);
            const timer = setTimeout(() => {
                setNotificationMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash.success]);
    
    // Data dari Auth/API 
    const name = user?.name || "Nama Tidak Ditemukan";
    const email = user?.email || "";
    const photo = user?.photo || "/images/default-profile.jpg"; 

    // Data DB yang bisa diedit - gunakan state
    const [nidn, setNidn] = useState(user?.NIDN || "");
    const [programStudi, setProgramStudi] = useState(user?.ProgramStudi || "");
    const [sintaId, setSintaId] = useState(user?.SintaID || "");
    const [scopusId, setScopusId] = useState(user?.ScopusID || "");

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveChanges = () => {
        if (isSaving) return;
        
        setIsSaving(true);
        
        const dataToSave = {
             name: name,
            NIDN: nidn,
            Prodi: programStudi,
            SintaID: sintaId,
            ScopusID: scopusId,
        };

        router.post("/app/profile/update", dataToSave, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
            },
            onError: (errors) => {
                console.error("❌ Gagal menyimpan perubahan:", errors);
                setNotificationMessage("❌ Gagal menyimpan perubahan. Silakan coba lagi.");
                setTimeout(() => setNotificationMessage(null), 5000); 
                setIsSaving(false);
            },
        });
    };

    // Generate inisial dari nama (2 huruf pertama)
    const getInitials = (fullName) => {
        if (!fullName) return "??";
        const names = fullName.trim().split(" ");
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    return (
        <AppLayout>
            <NotificationCard 
                message={notificationMessage} 
                onClose={() => setNotificationMessage(null)} 
            />
            
            <div className="min-h-screen bg-white">
                {/* 🌟 PERUBAHAN UTAMA: max-w-7xl untuk lebar maksimum */}
                <div className="max-w-7xl mx-auto p-4 md:px-10 pt-8"> 
                    
                    {/* Header: Pengaturan Akun */}
                    <div className="flex items-center mb-6 space-x-2 text-xl font-medium text-gray-800">
                        <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Pengaturan Akun</span>
                    </div>

                    {/* Bagian Foto Profil */}
                    <div className="flex flex-col items-center mb-8">
                        <p className="text-sm text-gray-600 mb-4">Add profile picture</p>
                        <div className="relative mb-2">
                            {/* Avatar/Photo */}
                            {photo ? (
                                <img
                                    src={photo}
                                    alt={name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display = "flex";
                                    }}
                                />
                            ) : null}
                            <div
                                className={`w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-gray-100 shadow-md flex items-center justify-center text-gray-700 font-bold text-3xl ${photo ? 'hidden' : ''}`}
                            >
                                {getInitials(name)}
                            </div>
                            
                            {/* Ikon Edit pada Foto */}
                            <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full border border-gray-300 shadow-md cursor-pointer hover:bg-gray-50">
                                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">Edit user profile</p>
                    </div>

                    {/* Daftar Field Profil */}
                    <div className="space-y-4 mb-8">
                        {/* Nama (ReadOnly) */}
                        <ProfileField
                            label="Nama"
                            value={name}
                            readOnly={true}
                        />

                        {/* Email (ReadOnly) */}
                        <ProfileField
                            label="Akun Email"
                            value={email}
                            readOnly={true}
                        />

                        {/* NIDN (Editable Input) */}
                        <ProfileField
                            label="NIDN"
                            value={nidn}
                            onChange={(e) => setNidn(e.target.value)}
                            placeholder="Masukkan NIDN"
                            readOnly={false}
                        />

                        {/* PROGRAM STUDI (SELECT DROPDOWN) */}
                        <ProfileField
                            label="Program Studi"
                            value={programStudi}
                            onChange={(e) => setProgramStudi(e.target.value)}
                            placeholder="Pilih Program Studi"
                            readOnly={false}
                            isSelect={true}
                            options={PROGRAM_STUDI_OPTIONS}
                        />

                        {/* SINTA ID (Editable Input) */}
                        <ProfileField
                            label="Sinta ID"
                            value={sintaId}
                            onChange={(e) => setSintaId(e.target.value)}
                            placeholder="Masukkan SINTA ID"
                            readOnly={false}
                        />

                        {/* Scopus ID (Editable Input) */}
                        <ProfileField
                            label="Scopus ID"
                            value={scopusId}
                            onChange={(e) => setScopusId(e.target.value)}
                            placeholder="Masukkan Scopus ID"
                            readOnly={false}
                        />
                    </div>

                    {/* Tombol Aksi (Kembali & Simpan Perubahan) */}
                    <div className="flex justify-between items-center pt-2 pb-10"> 
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150 font-medium"
                        >
                            Kembali
                        </button>

                        <button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md ${
                                isSaving 
                                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                                    : 'bg-black hover:bg-gray-800 text-white'
                            }`}
                        >
                            {isSaving ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </span>
                            ) : 'Simpan Perubahan'}
                        </button>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}