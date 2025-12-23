import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getDeviceInfo } from "@/lib/utils";
import { useForm, usePage } from "@inertiajs/react";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { route } from "ziggy-js";
import { router } from "@inertiajs/react"; 

import { AUTH_TOKEN_KEY } from "@/lib/consts";

export default function LoginPage() {
    const { appName, urlLoginSSO } = usePage().props;
    const [isProcessing, setIsProcessing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        systemId: "",
        info: "",
        username: "",
        password: "",
    });

   const handleSubmit = (event) => {
  event.preventDefault();
  post(route("auth.login-post"), {
    onSuccess: (page) => {
      // Simpan token ke localStorage
      const authToken = page.props?.authToken;
      if (authToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, authToken);

        // Redirect ke home agar Inertia memuat data auth terbaru
        router.get(route("home"));
      }
    },
    onError: (errors) => {
      console.error("Login gagal:", errors);
    },
  });
};


    useEffect(() => {
        if (typeof window !== "undefined") {
            const deviceInfo = getDeviceInfo();
            setData("systemId", deviceInfo.deviceId);
            setData("info", deviceInfo.deviceInfo);

            const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
            if (authToken) {
                router.post(
                    route("auth.login-check"),
                    {
                        authToken,
                    },
                    {
                        onStart: () => {
                            setIsProcessing(true);
                        },
                        onFinish: () => {
                            setIsProcessing(false);
                        },
                    }
                );
            }
        }
    }, []);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
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
                        <CardContent>
                            <FieldDescription className="mb-4 text-center">
                                Masuk menggunakan kredensial akun Anda.
                            </FieldDescription>
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="inputUsername">
                                            Username
                                        </FieldLabel>
                                        <div>
                                            <Input
                                                id="inputUsername"
                                                type="text"
                                                value={data.username}
                                                className={
                                                    errors.username
                                                        ? "border-red-600"
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "username",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            {errors.username && (
                                                <div className="text-sm text-red-600">
                                                    {errors.username}
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="inputPassword">
                                            Password
                                        </FieldLabel>
                                        <div>
                                            <Input
                                                id="inputPassword"
                                                type="password"
                                                value={data.password}
                                                className={
                                                    errors.password
                                                        ? "border-red-600"
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            {errors.password && (
                                                <div className="text-sm text-red-600">
                                                    {errors.password}
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                    <Field>
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing || isProcessing
                                            }
                                        >
                                            {processing || isProcessing ? (
                                                <span>
                                                    <LoaderCircle
                                                        className="mr-2 inline-block animate-spin"
                                                        size={16}
                                                    />
                                                    Memproses...
                                                </span>
                                            ) : (
                                                <span>Masuk</span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            type="button"
                                            disabled={
                                                processing || isProcessing
                                            }
                                            onClick={() =>
                                                window.open(
                                                    urlLoginSSO,
                                                    "_self"
                                                )
                                            }
                                        >
                                            Masuk dengan SSO
                                        </Button>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
