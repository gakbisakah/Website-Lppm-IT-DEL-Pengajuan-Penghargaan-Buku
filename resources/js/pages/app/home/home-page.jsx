import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { AUTH_TOKEN_KEY } from "@/lib/consts";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { route } from "ziggy-js";

export default function HomePage() {
    const { auth, appName, authToken } = usePage().props;

    useEffect(() => {
        if (authToken) {
            localStorage.setItem(AUTH_TOKEN_KEY, authToken);
        } else {
            window.location.href = route("auth.logout");
        }
    }, []);

    return (
        <AppLayout>
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        &#128075; Hay, {auth.name}
                    </CardTitle>
                    <CardDescription>
                        Selamat datang di aplikasi {appName}.
                    </CardDescription>
                </CardHeader>
            </Card>
        </AppLayout>
    );
}
