"use client";

import {
    IconDots,
    IconFolder,
    IconShare3,
    IconTrash,
    type Icon,
} from "@tabler/icons-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

export function NavArea({
    items,
}: {
    items: {
        name: string;
        url: string;
        icon: Icon;
    }[];
}) {
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden pt-0">
            <SidebarGroupLabel>Area</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <a href={item.url}>
                                <item.icon />
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
