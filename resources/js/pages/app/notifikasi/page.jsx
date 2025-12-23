// File: resources/js/Pages/app/notifikasi/page.jsx

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Bell } from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";
import ReviewNotificationCard from "./ReviewNotificationCard";

export default function NotificationPage({
    notifications,
    filters,
    booksForReview = {},
}) {
    const [searchValue, setSearchValue] = useState(filters.search || "");
    const [filterValue, setFilterValue] = useState(filters.filter || "semua");
    const [sortValue, setSortValue] = useState(filters.sort || "terbaru");
    const [selectedReviewNotif, setSelectedReviewNotif] = useState(null);

    const handleSearch = () => {
        router.get(
            "/notifikasi",
            {
                search: searchValue,
                filter: filterValue,
                sort: sortValue,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleFilterChange = (value) => {
        setFilterValue(value);
        router.get(
            "/notifikasi",
            {
                search: searchValue,
                filter: value,
                sort: sortValue,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSortChange = (value) => {
        setSortValue(value);
        router.get(
            "/notifikasi",
            {
                search: searchValue,
                filter: filterValue,
                sort: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleNotificationClick = (notification) => {
        // Check if this is a reviewer invitation notification
        const isReviewInvite =
            notification.reference_key?.startsWith("REVIEWER_INVITE_");
        const bookDetail = booksForReview[notification.id];

        if (isReviewInvite && bookDetail) {
            // Open modal for review notification
            setSelectedReviewNotif(notification);
        } else {
            // Mark as read for regular notifications
            if (!notification.is_read) {
                router.post(
                    `/notifikasi/${notification.id}/read`,
                    {},
                    {
                        preserveScroll: true,
                    }
                );
            }
        }
    };

    // UBAH: Menggunakan kelas theme-aware atau warna Tailwind yang sudah ditentukan (amber untuk peringatan)
    const getTypeColor = (type) => {
        if (type === "Info") return "text-blue-600"; // Menggunakan shade blue yang konsisten
        if (type === "Sukses") return "text-primary";
        if (type === "Peringatan") return "text-amber-600";
        if (type === "Error") return "text-destructive";
        return "text-muted-foreground";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day} / ${month} / ${year}`;
    };

    return (
        <AppLayout>
            <Head title="Notifikasi" />

            <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Notifikasi
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Pantau semua aktivitas dan pemberitahuan terbaru Anda di
                        sini.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="Cari notifikasi..."
                            // UBAH: bg-white/dark:bg-sidebar -> bg-background
                            className="bg-background"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                        />
                        <Button
                            variant="secondary"
                            // UBAH: bg-gray-100/dark:bg-muted -> biarkan variant secondary yang mengurus warna
                            onClick={handleSearch}
                        >
                            Cari
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Select
                            value={filterValue}
                            onValueChange={handleFilterChange}
                        >
                            {/* UBAH: bg-white/dark:bg-sidebar -> bg-background */}
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua</SelectItem>
                                <SelectItem value="belum_dibaca">
                                    Belum Dibaca
                                </SelectItem>
                                <SelectItem value="Info">Info</SelectItem>
                                <SelectItem value="Sukses">Sukses</SelectItem>
                                <SelectItem value="Peringatan">
                                    Peringatan
                                </SelectItem>
                                <SelectItem value="Error">Error</SelectItem>
                                <SelectItem value="System">System</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={sortValue}
                            onValueChange={handleSortChange}
                        >
                            {/* UBAH: bg-white/dark:bg-sidebar -> bg-background */}
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="terbaru">Terbaru</SelectItem>
                                <SelectItem value="terlama">Terlama</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    {notifications.map((item) => {
                        const isReviewInvite =
                            item.reference_key?.startsWith("REVIEWER_INVITE_");

                        return (
                            <Card
                                key={item.id}
                                className={`w-full p-4 flex flex-row items-center justify-between gap-4 hover:bg-accent/5 transition-colors cursor-pointer ${
                                    !item.is_read
                                        ? "bg-muted/30 border-l-4 border-l-primary"
                                        : ""
                                } ${
                                    isReviewInvite
                                        ? "border-2 border-primary/50" // UBAH: border-black/dark:border-white -> border-primary/50
                                        : "border border-input" // UBAH: border-gray-200/dark:border-gray-700 -> border-input
                                }`}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1 text-left">
                                    <div className="shrink-0">
                                        <div
                                            className={`h-10 w-10 rounded-full flex items-center justify-center bg-primary`}
                                        >
                                            {/* UBAH: bg-black/dark:bg-white -> bg-primary, text-white/dark:text-black -> text-primary-foreground */}
                                            <Bell className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col min-w-0">
                                        <h3 className="font-semibold text-base truncate">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {item.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p
                                        className={`text-xs font-medium ${getTypeColor(
                                            item.type
                                        )}`}
                                    >
                                        {item.type}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDate(item.created_at)}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}

                    {notifications.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-lg border border-dashed w-full">
                            Tidak ada notifikasi baru.
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {selectedReviewNotif && booksForReview[selectedReviewNotif.id] && (
                <ReviewNotificationCard
                    notification={selectedReviewNotif}
                    bookDetails={booksForReview[selectedReviewNotif.id]}
                    onClose={() => setSelectedReviewNotif(null)}
                />
            )}
        </AppLayout>
    );
}

NotificationPage.propTypes = {
    notifications: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            user_id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            message: PropTypes.string.isRequired,
            type: PropTypes.oneOf([
                "Info",
                "Sukses",
                "Peringatan",
                "Error",
                "System",
            ]).isRequired,
            is_read: PropTypes.bool.isRequired,
            created_at: PropTypes.string.isRequired,
            reference_key: PropTypes.string,
        })
    ).isRequired,
    filters: PropTypes.shape({
        search: PropTypes.string,
        filter: PropTypes.string,
        sort: PropTypes.string,
    }),
    booksForReview: PropTypes.object,
};

NotificationPage.defaultProps = {
    filters: {
        search: "",
        filter: "semua",
        sort: "terbaru",
    },
    booksForReview: {},
};
