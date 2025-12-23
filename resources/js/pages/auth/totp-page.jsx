import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { AUTH_TOKEN_KEY } from "@/lib/consts";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { route } from "ziggy-js";

export default function TOTPPage() {
    const { appName } = usePage().props;
    const { props } = usePage();

    const { data, setData, post, processing, errors } = useForm({
        kodeOTP: "",
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("auth.totp-post"), {
            onError: () => {
                setData("kodeOTP", "");
            },
        });
    };

    useEffect(() => {
        if (props.authToken) {
            localStorage.setItem(AUTH_TOKEN_KEY, props.authToken);
        } else {
            window.location.href = route("auth.logout");
        }
    }, []);

    useEffect(() => {
        if (data.kodeOTP.length === 6 && !processing) {
            window.document.getElementById("formTOTP").requestSubmit();
        }
    }, [data.kodeOTP, processing]);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="w-full max-w-xs">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto">
                                <img
                                    src="/img/logo/sdi-logo-dark-text.png"
                                    alt="Logo"
                                    style={{
                                        maxWidth: "156px",
                                        height: "auto",
                                    }}
                                />
                            </div>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                {appName}
                            </FieldSeparator>
                        </CardHeader>

                        {props.qrCode && (
                            <CardContent>
                                <FieldDescription className="text-center">
                                    Scan kode QR berikut menggunakan aplikasi
                                    autentikator Anda.
                                </FieldDescription>
                                <div className="flex justify-center">
                                    <img
                                        src={props.qrCode}
                                        alt="QR Code TOTP"
                                        style={{
                                            maxWidth: "100%",
                                        }}
                                    />
                                </div>

                                <hr />
                            </CardContent>
                        )}

                        <CardContent>
                            <FieldDescription className="mb-4 text-center">
                                Selesaikan verifikasi dua langkah berikut.
                            </FieldDescription>
                            <form onSubmit={handleSubmit} id="formTOTP">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="inputOTP">
                                            Verifikasi Kode
                                        </FieldLabel>
                                        <InputOTP
                                            disabled={processing}
                                            maxLength={6}
                                            id="inputOTP"
                                            value={data.kodeOTP}
                                            autoFocus
                                            onChange={(value) =>
                                                setData("kodeOTP", value)
                                            }
                                            required
                                        >
                                            <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                        {errors.kodeOTP && (
                                            <div className="text-sm text-red-600">
                                                {errors.kodeOTP}
                                            </div>
                                        )}
                                        <FieldDescription>
                                            Masukkan 6 digit kode yang terdapat
                                            pada aplikasi autentikator Anda.
                                        </FieldDescription>
                                    </Field>
                                    <FieldGroup>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Verifikasi
                                        </Button>
                                    </FieldGroup>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
