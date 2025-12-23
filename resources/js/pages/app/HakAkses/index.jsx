import { Badge } from "@/components/ui/badge";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { router, usePage } from "@inertiajs/react";
import * as Icon from "@tabler/icons-react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { HakAksesChangeDialog } from "./Dialogs/change-dialog";

import  HakAksesDeleteDialog  from "./Dialogs/delete-dialog";
import  HakAksesDeleteSelectedDialog  from "./Dialogs/delete-selected-dialog";

export default function Index() {
    const { aksesList, flash } = usePage().props;
    const [search, setSearch] = React.useState("");
    const [dataAkses, setDataAkses] = React.useState(aksesList);
    const [titleChangeDialog, setTitleChangeDialog] =
        React.useState("Tambah Hak Akses");

    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    // Data Edit
    const [isChangeDialogOpen, setIsChangeDialogOpen] = React.useState(false);
    const [dataEdit, setDataEdit] = React.useState(null);

    // Data Delete
    const [dataDelete, setDataDelete] = React.useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    // Data Delete Selected
    const [dataDeleteSelected, setDataDeleteSelected] = React.useState(null);
    const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] =
        React.useState(false);

    // Tampilkan notifikasi jika ada pesan flash
    React.useEffect(() => {
        if (flash.success) {
            router.reload({ only: ["aksesList"] });
            setIsChangeDialogOpen(false);
            setIsDeleteDialogOpen(false);
            setIsDeleteSelectedDialogOpen(false);
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    React.useEffect(() => {
        if (search === "") {
            setDataAkses(aksesList);
            return;
        }

        const filteredData = aksesList.filter((item) => {
            const user = item.user;
            const searchLower = search.toLowerCase();

            return (
                user.name.toLowerCase().includes(searchLower) ||
                user.username.toLowerCase().includes(searchLower) ||
                item.data_akses.some((akses) =>
                    akses.toLowerCase().includes(searchLower)
                )
            );
        });
        setDataAkses(filteredData);
    }, [search, aksesList]);

    // Definisi kolom untuk tabel Hak Akses
    const columns = [
        // Kolom Pilih
        {
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
        //  Kolom Identitas
        {
            id: "Identitas",
            accessorKey: "user",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                >
                    Identitas
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
                <div>
                    <span className="text-gray-400">
                        @{row.original.user.username}
                    </span>
                    <br />
                    <span className="font-medium">
                        {row.original.user.name}
                    </span>
                </div>
            ),
        },
        // Kolom Akses
        {
            id: "Hak Akses",
            accessorKey: "data_akses",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Hak Akses
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
                    {row.original.data_akses.map((akses) => (
                        <Badge
                            key={akses}
                            variant="secondary"
                            className="mr-1 mb-1"
                        >
                            {akses}
                        </Badge>
                    ))}
                </div>
            ),
        },
        // Kolom Tindakan
        {
            id: "Tindakan",
            header: "Tindakan",
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Icon.IconDotsVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-yellow-500"
                                onClick={() => {
                                    setDataEdit({
                                        id: row.original.id,
                                        userId: row.original.user_id,
                                        userName: `@${row.original.user.username} - ${row.original.user.name}`,
                                        hakAkses: row.original.data_akses,
                                    });
                                    setTitleChangeDialog("Ubah Hak Akses");
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
                            <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => {
                                    setDataDelete({
                                        id: row.original.id,
                                        userId: row.original.user_id,
                                        userName: row.original.user.username,
                                        hakAkses: row.original.data_akses,
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

    // Inisialisasi tabel dengan useReactTable
    const table = useReactTable({
        data: dataAkses,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <AppLayout>
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {/* Judul */}
                        <div className="flex-1">
                            <div className="flex items-center">
                                <Icon.IconLock className="inline mr-2" />
                                <span>Hak Akses</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Search Input */}
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

                            {/* Dropdown filter table */}
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

                            {/* Tombol Tambah */}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDataEdit(null);
                                    setTitleChangeDialog("Tambah Hak Akses");
                                    setIsChangeDialogOpen(true);
                                }}
                            >
                                <Icon.IconPlus />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Tombol Aksi Ketika Row Dipilih  */}
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
                                            .rows.map(
                                                (row) => row.original.user_id
                                            );
                                        setDataDeleteSelected({
                                            userIds: selectedIds,
                                            userNames: table
                                                .getFilteredSelectedRowModel()
                                                .rows.map(
                                                    (row) =>
                                                        `@${row.original.user.username} - ${row.original.user.name}`
                                                ),
                                        });
                                        setIsDeleteSelectedDialogOpen(true);
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

                    {/* Table */}
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
                                            Belum ada data yang tersedia.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="text-muted-foreground flex-1 text-sm">
                            Memilih{" "}
                            {table.getFilteredSelectedRowModel().rows.length}{" "}
                            dari {table.getFilteredRowModel().rows.length} data
                            yang tersedia.
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Change */}
            <HakAksesChangeDialog
                dataEdit={dataEdit}
                dialogTitle={titleChangeDialog}
                openDialog={isChangeDialogOpen}
                setOpenDialog={setIsChangeDialogOpen}
            />

            {/* Dialog Delete */}
            <HakAksesDeleteDialog
                dataDelete={dataDelete}
                openDialog={isDeleteDialogOpen}
                setOpenDialog={setIsDeleteDialogOpen}
            />

            {/* Dialog Delete Selected */}
            <HakAksesDeleteSelectedDialog
                dataDelete={dataDeleteSelected}
                openDialog={isDeleteSelectedDialogOpen}
                setOpenDialog={setIsDeleteSelectedDialogOpen}
            />
        </AppLayout>
    );
}