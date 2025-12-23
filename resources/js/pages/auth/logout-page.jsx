import { useEffect } from "react";
import { route } from "ziggy-js";

export default function LogoutPage() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            window.location.href = route("auth.login");
        }
    }, []);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6"></div>
        </div>
    );
}
