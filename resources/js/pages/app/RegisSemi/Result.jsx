// File: resources/js/Pages/App/RegisSemi/Result.jsx

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import {
    ArrowLeft,
    User,
    Calendar,
    MessageSquare,
    FileText,
} from "lucide-react";
import PropTypes from "prop-types";

/**
 * Komponen untuk menampilkan satu komentar/penilaian dari reviewer
 */
const ReviewerCommentCard = ({ reviewerName, comment, reviewedAt, index }) => {
    return (
        <div
            // UBAH: border-2 border-black/dark:border-white -> border-2 border-input
            className="border-2 border-input rounded-lg overflow-hidden bg-card shadow-lg hover:shadow-xl transition-shadow"
        >
            {/* Header Card */}
            {/* UBAH: bg-black/dark:bg-white -> bg-secondary, border-black/dark:border-white -> border-border */}
            <div className="bg-secondary p-4 border-b-2 border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* UBAH: bg-white/dark:bg-black, text-black/dark:text-white -> bg-background, text-primary */}
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border-2 border-background">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            {/* UBAH: text-white/dark:text-black -> text-secondary-foreground */}
                            <div className="text-sm font-bold text-secondary-foreground">
                                Reviewer #{index + 1}
                            </div>
                            {/* UBAH: text-gray-300/dark:text-gray-700 -> text-muted-foreground */}
                            <div className="text-xs text-muted-foreground font-medium">
                                {reviewerName}
                            </div>
                        </div>
                    </div>
                    {reviewedAt && (
                        // UBAH: text-gray-300/dark:text-gray-700 -> text-muted-foreground
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">
                                {reviewedAt}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Comment Content */}
            {/* UBAH: bg-white/dark:bg-gray-900 -> bg-card */}
            <div className="p-5 bg-card">
                <div className="flex items-start gap-2 mb-3">
                    {/* UBAH: text-black/dark:text-white -> text-primary */}
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    {/* UBAH: text-black/dark:text-white -> text-foreground */}
                    <h4 className="font-bold text-foreground">
                        Catatan Review:
                    </h4>
                </div>
                <div className="pl-7">
                    {/* UBAH: text-gray-800/dark:text-gray-200 -> text-foreground */}
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {comment}
                    </p>
                </div>
            </div>
        </div>
    );
};

ReviewerCommentCard.propTypes = {
    reviewerName: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
    reviewedAt: PropTypes.string,
    index: PropTypes.number.isRequired,
};

/**
 * Komponen Halaman Hasil Penilaian Reviewer
 */
export default function Result({
    bukuId,
    bookTitle,
    bookIsbn,
    bookAuthor,
    results = [],
    reviewCount = 0,
}) {
    const handleGoBack = () => {
        router.visit(route("regis-semi.show", bukuId));
    };

    return (
        <AppLayout>
            <Head title={`Review Hasil - ${bookTitle || "Buku"}`} />

            <div className="max-w-6xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleGoBack}
                            variant="outline"
                            // UBAH: Hapus semua hardcoded class, biarkan variant yang menentukan style
                            // border-2 border-input adalah default untuk outline
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                        <div>
                            {/* UBAH: text-black/dark:text-white -> text-foreground */}
                            <h1 className="text-2xl font-bold text-foreground">
                                Hasil Review Buku
                            </h1>
                            {/* UBAH: text-gray-600/dark:text-gray-400 -> text-muted-foreground */}
                            <p className="text-sm text-muted-foreground mt-1">
                                Total {reviewCount} review telah diterima
                            </p>
                        </div>
                    </div>
                </div>

                {/* BOOK INFO CARD */}
                {/* UBAH: border-2 border-black/dark:border-white -> border border-input */}
                <Card className="border border-input shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                            {/* UBAH: text-black/dark:text-white -> text-primary */}
                            <FileText className="h-6 w-6 text-primary mt-1" />
                            <div className="flex-1">
                                {/* UBAH: text-black/dark:text-white -> text-foreground */}
                                <h2 className="text-lg font-bold text-foreground mb-1">
                                    {bookTitle}
                                </h2>
                                {/* UBAH: text-gray-600/dark:text-gray-400 -> text-muted-foreground */}
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {bookIsbn && (
                                        <span className="flex items-center gap-1">
                                            <span className="font-semibold">
                                                ISBN:
                                            </span>{" "}
                                            {bookIsbn}
                                        </span>
                                    )}
                                    {bookAuthor && (
                                        <span className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span className="font-semibold">
                                                Penulis:
                                            </span>{" "}
                                            {bookAuthor}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* REVIEW RESULTS */}
                {results.length > 0 ? (
                    <div className="space-y-5">
                        {/* UBAH: text-black/dark:text-white -> text-foreground */}
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            {/* UBAH: text-foreground */}
                            <MessageSquare className="h-5 w-5 text-foreground" />
                            Catatan dari Reviewer
                        </h3>

                        {results.map((result, index) => (
                            <ReviewerCommentCard
                                key={result.id}
                                reviewerName={result.reviewer_name}
                                comment={result.comment}
                                reviewedAt={result.formatted_date}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    // Empty State
                    // UBAH: border-2 border-dashed border-gray-300/dark:border-gray-600 -> border-2 border-dashed border-border
                    <Card className="border-2 border-dashed border-border">
                        <CardContent className="p-12 text-center">
                            {/* UBAH: text-gray-400/dark:text-gray-600 -> text-muted-foreground */}
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            {/* UBAH: text-gray-700/dark:text-gray-300 -> text-foreground */}
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Belum Ada Review
                            </h3>
                            {/* UBAH: text-gray-500/dark:text-gray-400 -> text-muted-foreground */}
                            <p className="text-sm text-muted-foreground">
                                Buku ini belum mendapatkan review dari reviewer
                                yang diundang.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

Result.propTypes = {
    bukuId: PropTypes.number.isRequired,
    bookTitle: PropTypes.string,
    bookIsbn: PropTypes.string,
    bookAuthor: PropTypes.string,
    results: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            reviewer_name: PropTypes.string.isRequired,
            reviewer_email: PropTypes.string,
            comment: PropTypes.string.isRequired,
            reviewed_at: PropTypes.string,
            formatted_date: PropTypes.string,
        })
    ),
    reviewCount: PropTypes.number,
};
