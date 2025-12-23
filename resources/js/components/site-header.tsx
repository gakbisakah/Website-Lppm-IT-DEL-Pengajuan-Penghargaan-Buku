import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { Link } from "@inertiajs/react";

export function SiteHeader() {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">Documents</h1>
                <div className="ml-auto flex items-center gap-2">
                    {/* Tombol Notifikasi - Saya ubah ke variant="outline" agar lebih terlihat */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-foreground"
                        asChild
                    >
                        <Link href="/notifikasi-dummy">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Notifikasi</span>
                        </Link>
                    </Button>

                    <Button
                        variant="ghost"
                        asChild
                        size="sm"
                        className="hidden sm:flex"
                    >
                        <a
                            href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="dark:text-foreground"
                        >
                            GitHub
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    );
}