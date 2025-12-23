
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { router, usePage } from "@inertiajs/react";
import { Select, SelectValue } from "@radix-ui/react-select";
import * as Icon from "@tabler/icons-react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { TodoChangeDialog } from "./dialogs/change-dialog";
import { TodoDeleteDialog } from "./dialogs/delete-dialog";

export default function TodoPage() {
    // ============================ DATA & STATE ============================

    // Ambil data dari server melalui Inertia
    const {
        todoList,
        flash,
        isEditor,
        perPage,
        search: initialSearch,
        page: initialPage,
        perPageOptions,
    } = usePage().props;

    // State untuk pencarian dengan debounce
    const [search, setSearch] = React.useState(initialSearch || "");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const titleChangeDialog = "Tambah Todo";

    // State untuk tabel
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    // State untuk dialog edit
    const [isChangeDialogOpen, setIsChangeDialogOpen] = React.useState(false);
    const [dataEdit, setDataEdit] = React.useState(null);

    // State untuk dialog hapus
    const [dataDelete, setDataDelete] = React.useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    // Ref untuk menandai initial page load
    const isFirst = React.useRef(true);

    // ============================ EFFECTS ============================

    // Debounce untuk input pencarian
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // Delay 500ms

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch data ketika pencarian berubah
    React.useEffect(() => {
        const targetPage = isFirst.current ? initialPage : 1;
        isFirst.current = false;

        if (debouncedSearch !== undefined) {
            handlePagination(
                route("todo") + `?page=${targetPage}&search=${debouncedSearch}`,
                debouncedSearch
            );
        }
    }, [debouncedSearch]);

    // Handle flash messages dan reload data
    React.useEffect(() => {
        if (flash.success) {
            // Reload hanya data todoList
            handlePagination(route("todo") + `?page=1&perPage=${perPage}`, "");
            setIsChangeDialogOpen(false);
            setIsDeleteDialogOpen(false);
            setRowSelection({}); // Reset seleksi baris
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // ============================ FUNCTIONS ============================

    /**
     * Handle perubahan pagination
     * @param {string} page - URL halaman tujuan
     */
    const handlePagination = (page, search) => {
        // Reset seleksi baris saat halaman berubah
        setSearch(search);
        setRowSelection({});

        // Parse URL dan parameter
        const url = new URL(page);
        const paramPage = url.searchParams.get("page") || page;
        const paramPerPage = url.searchParams.get("perPage") || perPage;
        // Bangun URL lengkap
        const fixUrl =
            route("todo") +
            `?page=${paramPage}&perPage=${paramPerPage}&search=${search}`;

        // Panggil router Inertia
        router.visit(fixUrl, {
            preserveState: true,
            replace: true,
            only: ["todoList"],
        });
    };

    // ============================ TABLE COLUMNS ============================

    // Definisi kolom tabel
    let columns = [
        // Kolom seleksi baris
        {
            forEditor: true,
            id: "Pilih Baris",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Pilih semua baris"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Pilih baris"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        // Nomor urut
        {
            id: "No",
            header: "No",
            cell: ({ row }) => {
                return (
                    <div>
                        {(
                            (todoList.current_page - 1) * todoList.per_page +
                            row.index +
                            1
                        ).toString()}
                    </div>
                );
            },
            enableSorting: false,
        },
        // Kolom judul
        {
            id: "Judul",
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                >
                    {column.id}
                    {column.getIsSorted() ? (
                        column.getIsSorted() === "asc" ? (
                            <Icon.IconArrowUp size={16} />
                        ) : (
                            <Icon.IconArrowDown size={16} />
                        )
                    ) : (
                        <Icon.IconArrowsDownUp />
                    )}
                </Button>
            ),
            cell: ({ row }) => <div>{row.original.title}</div>,
        },

        // Kolom status selesai
        {
            id: "Status Selesai",
            accessorKey: "is_done",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {column.id}
                    {column.getIsSorted() ? (
                        column.getIsSorted() === "asc" ? (
                            <Icon.IconArrowUp size={16} />
                        ) : (
                            <Icon.IconArrowDown size={16} />
                        )
                    ) : (
                        <Icon.IconArrowsDownUp />
                    )}
                </Button>
            ),
            cell: ({ row }) => (
                <div>{row.original.is_done ? "Selesai" : "Belum Selesai"}</div>
            ),
        },

        // Kolom Tanggal Dibuat
        {
            id: "Dibuat Pada",
            accessorKey: "created_at",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {column.id}
                    {column.getIsSorted() ? (
                        column.getIsSorted() === "asc" ? (
                            <Icon.IconArrowUp size={16} />
                        ) : (
                            <Icon.IconArrowDown size={16} />
                        )
                    ) : (
                        <Icon.IconArrowsDownUp />
                    )}
                </Button>
            ),
            cell: ({ row }) => (
                <div className="text-left">
                    {dayjs(row.original.created_at).format("DD MMMM YYYY")}
                </div>
            ),
        },

        // Kolom tindakan
        {
            forEditor: true,
            id: "Tindakan",
            header: "Tindakan",
            isVisible: isEditor,
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <Icon.IconDotsVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Tombol ubah */}
                            <DropdownMenuItem
                                className="text-yellow-500"
                                onClick={() => {
                                    setDataEdit({
                                        todoId: row.original.id,
                                        title: row.original.title,
                                        description: row.original.description,
                                        isDone: row.original.is_done,
                                    });
                                    setIsChangeDialogOpen(true);
                                }}
                            >
                                <Icon.IconPencil
                                    size={16}
                                    className="mr-2 text-yellow-500"
                                />
                                Ubah
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* Tombol hapus */}
                            <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => {
                                    setDataDelete({
                                        todoIds: [row.original.id],
                                        dataList: [
                                            {
                                                id: row.original.id,
                                                title: row.original.title,
                                            },
                                        ],
                                    });
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                <Icon.IconTrash
                                    size={16}
                                    className="mr-2 text-red-500"
                                />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // ============================ TABLE CONFIG ============================

    // Kalau bukan editor hapus kolom seleksi baris dan tindakan
    if (!isEditor) {
        columns = columns.filter(
            (col) => !col.forEditor || col.forEditor === isEditor
        );
    }

    // Inisialisasi tabel dengan react-table
    const table = useReactTable({
        data: todoList.data, // Data dari pagination Laravel
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        manualPagination: true, // Pagination dihandle server-side
        pageCount: todoList.last_page, // Total halaman dari Laravel
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    // ============================ RENDER ============================

    return (
        <AppLayout>
            {/* Kartu utama */}
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {/* Judul halaman */}
                        <div className="flex-1">
                            <div className="flex items-center">
                                <Icon.IconChecklist className="inline mr-2" />
                                <span>Todo List</span>
                            </div>
                        </div>

                        {/* Toolbar: search, filter, tambah */}
                        <div className="flex items-center space-x-2">
                            {/* Input pencarian */}
                            <InputGroup>
                                <InputGroupInput
                                    placeholder="Cari..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <InputGroupAddon>
                                    <Icon.IconSearch />
                                </InputGroupAddon>
                            </InputGroup>

                            {/* Dropdown filter kolom */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="ml-auto"
                                    >
                                        Kolom <ChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuCheckboxItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="capitalize font-medium"
                                        checked={table
                                            .getAllColumns()
                                            .filter((col) => col.getCanHide())
                                            .every((col) => col.getIsVisible())}
                                        onCheckedChange={(value) => {
                                            table
                                                .getAllColumns()
                                                .filter((col) =>
                                                    col.getCanHide()
                                                )
                                                .forEach((col) =>
                                                    col.toggleVisibility(
                                                        !!value
                                                    )
                                                );
                                        }}
                                    >
                                        Pilih Semua
                                    </DropdownMenuCheckboxItem>
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem
                                                onSelect={(e) =>
                                                    e.preventDefault()
                                                }
                                                key={`column-toggle-${column.id}`}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(
                                                        !!value
                                                    )
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Tombol tambah todo baru */}
                            {isEditor && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setDataEdit(null);
                                        setIsChangeDialogOpen(true);
                                    }}
                                >
                                    <Icon.IconPlus />
                                </Button>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Tombol hapus multiple (muncul ketika ada baris terpilih) */}
                    {table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <>
                            <div className="text-right mb-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    onClick={() => {
                                        const selectedIds = table
                                            .getFilteredSelectedRowModel()
                                            .rows.map((row) => row.original.id);
                                        setDataDelete({
                                            todoIds: selectedIds,
                                            dataList: table
                                                .getFilteredSelectedRowModel()
                                                .rows.map((row) => ({
                                                    id: row.original.id,
                                                    title: row.original.title,
                                                })),
                                        });
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <Icon.IconTrash className="mr-2" />
                                    Hapus Semua yang Dipilih (
                                    {
                                        table.getFilteredSelectedRowModel().rows
                                            .length
                                    }
                                    )
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Tabel data todo */}
                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader className="bg-primary">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="text-primary-foreground"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() &&
                                                "selected"
                                            }
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            {search
                                                ? "Tidak ada data yang sesuai dengan pencarian."
                                                : "Belum ada data yang tersedia."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Kontrol pagination */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex-1">
                            {/* Pilihan data per halaman */}
                            <div className="flex items-center">
                                <label className="mr-2 text-sm text-muted-foreground">
                                    Data per halaman
                                </label>
                                <Select
                                    className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={perPage}
                                    onValueChange={(perPage) => {
                                        handlePagination(
                                            route("todo") +
                                                `?page=1&perPage=${perPage}`,
                                            debouncedSearch
                                        );
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((size) => (
                                            <SelectItem
                                                key={size}
                                                value={size.toString()}
                                            >
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Info data yang ditampilkan */}
                            <div className="text-muted-foreground text-sm">
                                Menampilkan {todoList.from} sampai {todoList.to}{" "}
                                dari {todoList.total} data.
                                {table.getFilteredSelectedRowModel().rows
                                    .length > 0 && (
                                    <span className="ml-2">
                                        (
                                        {
                                            table.getFilteredSelectedRowModel()
                                                .rows.length
                                        }{" "}
                                        dipilih)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Navigasi halaman */}
                        <div className="flex items-center space-x-2">
                            {/* Tombol halaman sebelumnya */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handlePagination(
                                        todoList.prev_page_url,
                                        debouncedSearch
                                    )
                                }
                                disabled={!todoList.prev_page_url}
                            >
                                Previous
                            </Button>

                            {/* Info halaman saat ini */}
                            <span className="text-sm text-muted-foreground">
                                Halaman {todoList.current_page} dari{" "}
                                {todoList.last_page}
                            </span>

                            {/* Tombol halaman berikutnya */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handlePagination(
                                        todoList.next_page_url,
                                        debouncedSearch
                                    )
                                }
                                disabled={!todoList.next_page_url}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ============================ DIALOGS ============================ */}

            {/* Dialog ubah/tambah todo */}
            <TodoChangeDialog
                dataEdit={dataEdit}
                dialogTitle={titleChangeDialog}
                openDialog={isChangeDialogOpen}
                setOpenDialog={setIsChangeDialogOpen}
            />

            {/* Dialog hapus todo */}
            <TodoDeleteDialog
                dataDelete={dataDelete}
                openDialog={isDeleteDialogOpen}
                setOpenDialog={setIsDeleteDialogOpen}
            />
        </AppLayout>
    );
}