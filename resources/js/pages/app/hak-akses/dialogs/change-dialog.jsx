import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useForm, usePage } from "@inertiajs/react";
import { Separator } from "@radix-ui/react-separator";
import axios from "axios";
import { Check, ChevronsUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { route } from "ziggy-js";

export function HakAksesChangeDialog({
    dataEdit,
    dialogTitle,
    openDialog,
    setOpenDialog,
}) {
    const { optionRoles } = usePage().props;
    const [isOpenSelectUser, setIsOpenSelectUser] = useState(false);

    const [searchUser, setSearchUser] = useState("");
    const [debouncedSearchUser] = useDebounce(searchUser, 500);
    const [dataUserId, setDataUserId] = useState("");
    const [loadingSearchUser, setLoadingSearchUser] = useState(false);
    const [users, setUsers] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        userId: "",
        hakAkses: [],
    });

    useEffect(() => {
        if (dataEdit && dataEdit.userName) {
            setData("hakAkses", dataEdit.hakAkses || []);
            setData("userId", dataEdit.userId || "");
        } else {
            setData("hakAkses", []);
            setData("userId", "");
        }
    }, [dataEdit]);

    // Effect untuk sinkronisasi dataUserId dengan form data
    useEffect(() => {
        setData("userId", dataUserId);
    }, [dataUserId]);

    // Effect untuk handle API call
    useEffect(() => {
        const fetchUsers = async () => {
            // Reset users jika search kosong
            if (!debouncedSearchUser.trim()) {
                // setUsers([]);
                return;
            }

            setLoadingSearchUser(true);
            try {
                const authToken = localStorage.getItem("authToken");
                if (!authToken) {
                    // console.error("No auth token found");
                    return;
                }

                const response = await axios.post(
                    route("api.fetch-users"),
                    { search: debouncedSearchUser },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                // Debug: lihat struktur response
                // console.log("API Response:", response.data);

                // Handle berbagai kemungkinan struktur response
                let usersData = [];
                if (response.data.data?.users) {
                    usersData = response.data.data.users;
                } else if (response.data.users) {
                    usersData = response.data.users;
                } else if (Array.isArray(response.data.data)) {
                    usersData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    usersData = response.data;
                }

                const formattedUsers = usersData.map((user) => ({
                    id: user.id,
                    value: user.id,
                    label: `(${user.username}) ${user.name} - ${user.alias}`,
                }));

                // console.log("Formatted users:", formattedUsers);
                setUsers(formattedUsers);
            } catch (_error) {
                // console.error("Error fetching users:", error);
                setUsers([]);
            } finally {
                setLoadingSearchUser(false);
            }
        };

        fetchUsers();
    }, [debouncedSearchUser]);

    // Reset form ketika dialog dibuka/tutup
    useEffect(() => {
        if (!openDialog) {
            setSearchUser("");
            setDataUserId("");
            setUsers([]);
            setIsOpenSelectUser(false);
        }
    }, [openDialog]);

    const handleSubmit = () => {
        post(route("hak-akses.change-post"), data);
    };
    return (
        <>
            <Sheet open={openDialog} onOpenChange={setOpenDialog}>
                <SheetContent aria-describedby="form-dialog">
                    <SheetHeader className="pb-0">
                        <SheetTitle>{dialogTitle}</SheetTitle>
                        <SheetDescription>
                            Silahkan isi data hak akses pada form di bawah ini.
                        </SheetDescription>
                    </SheetHeader>
                    <Separator className="border-b" />
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        {/* Pilih Pengguna */}
                        {dataEdit && dataEdit.userName ? (
                            <div className="grid gap-3">
                                <Label>Pengguna</Label>
                                <Input
                                    value={dataEdit.userName}
                                    disabled={true}
                                />
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                <Label htmlFor="selectSearchUser">
                                    Pilih Pengguna
                                </Label>
                                <Popover
                                    open={isOpenSelectUser}
                                    onOpenChange={setIsOpenSelectUser}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isOpenSelectUser}
                                            className="justify-between font-normal"
                                        >
                                            {dataUserId
                                                ? users.find(
                                                      (user) =>
                                                          user.value ==
                                                          dataUserId
                                                  )?.label || "Memuat..."
                                                : "Cari pengguna..."}
                                            <ChevronsUpDownIcon className="opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-full min-w-[300px]">
                                        <Command>
                                            <CommandInput
                                                placeholder="Cari pengguna..."
                                                className="h-9"
                                                value={searchUser}
                                                onValueChange={setSearchUser}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {loadingSearchUser ? (
                                                        <div className="flex items-center justify-center py-2">
                                                            <Spinner className="size-6 mr-2" />
                                                            Memuat...
                                                        </div>
                                                    ) : (
                                                        "Tidak ada hasil yang sesuai."
                                                    )}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {users.map((itemUser) => (
                                                        <CommandItem
                                                            key={itemUser.id}
                                                            value={
                                                                itemUser.label
                                                            } // Gunakan label untuk search
                                                            onSelect={() => {
                                                                setDataUserId(
                                                                    itemUser.value ===
                                                                        dataUserId
                                                                        ? ""
                                                                        : itemUser.value
                                                                );
                                                                setIsOpenSelectUser(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            {itemUser.label}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    dataUserId ===
                                                                        itemUser.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.userId && (
                                    <p className="text-sm text-red-500">
                                        {errors.userId}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Pilih Hak Akses */}
                        <div className="grid gap-3">
                            <Label htmlFor="inputHakAkses">Hak Akses</Label>
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    {optionRoles.map((role, index) => (
                                        <Label
                                            key={`role-${index}`}
                                            className="font-normal flex items-center gap-2"
                                        >
                                            <Checkbox
                                                checked={data.hakAkses.includes(
                                                    role
                                                )}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setData("hakAkses", [
                                                            ...data.hakAkses,
                                                            role,
                                                        ]);
                                                    } else {
                                                        setData(
                                                            "hakAkses",
                                                            data.hakAkses.filter(
                                                                (r) =>
                                                                    r !== role
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                            <span>{role}</span>
                                        </Label>
                                    ))}
                                </div>
                            </div>
                            {errors.hakAkses && (
                                <p className="text-sm text-red-500">
                                    {errors.hakAkses}
                                </p>
                            )}
                        </div>
                    </div>
                    <SheetFooter>
                        <Button
                            onClick={handleSubmit}
                            type="button"
                            disabled={processing}
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                type="button"
                                disabled={processing}
                            >
                                Batal
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
