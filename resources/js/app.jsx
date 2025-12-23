import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./providers/theme-provider";
import { Ziggy } from "./ziggy.js";

createInertiaApp({
   resolve: (name) => {
    const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });

    // Case-insensitive match
    const foundKey = Object.keys(pages).find((key) =>
        key.toLowerCase().endsWith(`${name}.jsx`.toLowerCase())
    );

    if (!foundKey) {
        throw new Error(`Page "${name}" tidak ditemukan di ./Pages/`);
    }

    return pages[foundKey].default;
},

    setup({ el, App, props }) {
        // Inject Ziggy routes
        if (props.initialPage.props.ziggy) {
            props.initialPage.props.ziggy = {
                ...Ziggy,
                location: new URL(Ziggy.url).href,
            };
        }

        // Render React App
        createRoot(el).render(
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );
    },
});
