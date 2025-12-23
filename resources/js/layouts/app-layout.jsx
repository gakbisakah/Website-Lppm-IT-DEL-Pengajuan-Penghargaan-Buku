import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import { Bell, Moon, Sun, HandCoins } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useTheme } from "@/providers/theme-provider";
import * as Icon from "@tabler/icons-react";
import { Toaster } from "sonner";
import { route } from "ziggy-js";
import { NavUser } from "@/components/nav-user"; // ✅ IMPORT NAVUSER

export default function AppLayout({ children }) {
    const { auth, appName, pageName } = usePage().props || {};
    const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme();

    const colorThemes = [
        "blue", "green", "default", "orange", "red", "rose", "violet", "yellow"
    ];

    const rolesUser = Array.isArray(auth?.roles) ? auth.roles : [];
    const aksesUser = Array.isArray(auth?.akses) ? auth.akses : [];

    const hasRole = (role) => {
        if (rolesUser.length === 0 && aksesUser.length === 0) return true;
        return rolesUser.includes(role) || aksesUser.includes(role);
    };

    // HRD MENU
    const navDataHrd = [
        {
            title: "Main",
            items: [
                { title: "Beranda", url: route("hrd.home"), icon: Icon.IconHome },
            ]
        },
        {
            title: "Admin",
            items: [
                { title: "Hak Akses", url: route("hak-akses"), icon: Icon.IconLock },
            ],
        },
    ];

    // LPPM STAFF MENU
    const navDataLppmStaff = [
        {
            title: "Main",
            items: [
                { title: "Beranda", url: route("home"), icon: Icon.IconHome },
               
            ]
        },
        {
            title: "Registrasi Masuk",
            collapsible: true,
            items: [
                { title: "Registrasi Jurnal Masuk", url: route("regis-semi.index"), icon: Icon.IconFileCertificate },
                { title: "Registrasi Seminar Masuk", url: route("regis-semi.index"), icon: Icon.IconPresentation },
            ],
        },
        {
            title: "Penghargaan Masuk",
            collapsible: true,
            items: [
                { title: "Penghargaan Buku Masuk", url: route("regis-semi.indexx"), icon: Icon.IconBook2 },
                { title: "Penghargaan Jurnal Masuk", url: route("regis-semi.index"), icon: Icon.IconFileCertificate },
                { title: "Penghargaan Seminar Masuk", url: route("regis-semi.index"), icon: Icon.IconPresentation },
            ],
        },
        {
            title: "Admin",
            items: [
                { title: "Hak Akses", url: route("hak-akses"), icon: Icon.IconLock },
            ],
        },
    ];

    // DEFAULT MENU (Dosen / LPPM Ketua)
    const navDataDefault = [
        {
            title: "Main",
            items: [
                { title: "Beranda", url: route("home"), icon: Icon.IconHome },
               
            ]
        },

        // Registrasi
        ...((hasRole("Dosen") || hasRole("Lppm Ketua")) ? [{
            title: "Registrasi",
            collapsible: true,
            groupIcon: HandCoins,
            items: [
                { title: "Seminar", url: route("regis-semi.index"), icon: Icon.IconNotebook },
                { title: "Jurnal", url: route("regis-semi.index"), icon: Icon.IconBook },
            ],
        }] : []),

        // Penghargaan
        ...((hasRole("Dosen") || hasRole("Lppm Ketua")) ? [{
            title: "Penghargaan",
            collapsible: true,
             groupIcon: Icon.IconAward,
            items: [
                { title: "Penghargaan Buku", url: route("app.penghargaan.buku.index"), icon: Icon.IconBook2 },
                { title: "Penghargaan Jurnal", url: route("regis-semi.index"), icon: Icon.IconFileCertificate },
                { title: "Penghargaan Seminar", url: route("regis-semi.index"), icon: Icon.IconPresentation },
            ],
        }] : []),

        // Registrasi Masuk
        ...(hasRole("Lppm Ketua") ? [{
            title: "Registrasi Masuk",
            collapsible: true,
            items: [
                { title: "Registrasi Jurnal Masuk", url: route("regis-semi.index"), icon: Icon.IconFileCertificate },
                { title: "Registrasi Seminar Masuk", url: route("regis-semi.index"), icon: Icon.IconPresentation },
            ],
        }] : []),

        // Penghargaan Masuk
        ...(hasRole("Lppm Ketua") ? [{
            title: "Penghargaan Masuk",
            collapsible: true,
            items: [
                { title: "Penghargaan Buku Masuk", url: route("regis-semi.index"), icon: Icon.IconBook2 },
                { title: "Penghargaan Jurnal Masuk", url: route("regis-semi.index"), icon: Icon.IconFileCertificate },
                { title: "Penghargaan Seminar Masuk", url: route("regis-semi.index"), icon: Icon.IconPresentation },
            ],
        }] : []),

        {
            title: "Admin",
            items: [
                { title: "Hak Akses", url: route("hak-akses"), icon: Icon.IconLock },
            ],
        },
    ];

    // Tentukan navData berdasarkan role
    const navData = hasRole("Hrd") ? navDataHrd :
        hasRole("Lppm Staff") ? navDataLppmStaff :
            navDataDefault;

    return (
        <>
            <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" }}>
                <AppSidebar
                    active={pageName}
                    user={auth}
                    navData={navData}
                    appName={appName}
                    variant="inset"
                />

                <SidebarInset>
                    <header className="flex h-(--header-height) items-center gap-2 border-b sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
                        <div className="flex w-full items-center gap-2 px-4 lg:px-6">

                            <SidebarTrigger />

                            <Separator orientation="vertical" className="mx-2 h-4" />

                            <div className="ml-auto flex items-center gap-2">

                                {/* Notifikasi */}
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={route("notifications.index")}>
                                        <Bell className="h-4 w-4" />
                                    </Link>
                                </Button>

                                {/* Theme color */}
                                <Select value={colorTheme} onValueChange={setColorTheme}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tema" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Tema</SelectLabel>
                                            {colorThemes.map((item) => (
                                                <SelectItem key={item} value={item}>
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {/* Dark Mode */}
                                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                    {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </Button>

                                {/* ✅ USER MENU (NavUser) */}
                                <NavUser user={auth?.user} />

                            </div>
                        </div>
                    </header>

                    {/* CONTENT */}
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 px-4 md:px-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            <Toaster richColors position="top-center" />
        </>
    );
}
