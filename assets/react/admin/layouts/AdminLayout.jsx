import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Sidebar from './Sidebar';

function getInitials(email) {
    if (!email) return '?';
    const local = email.split('@')[0];
    const parts  = local.split(/[._-]/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return local.slice(0, 2).toUpperCase();
}

const SIDEBAR_W = 256; // w-64

export default function AdminLayout({ userEmail = '', logoutUrl = '/deconnexion' }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="bg-background">
            <Sidebar open={open} />

            <header
                className="fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b bg-background px-4 transition-all duration-300"
                style={{ left: open ? SIDEBAR_W : 0 }}
            >
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={open ? 'Réduire la sidebar' : 'Ouvrir la sidebar'}
                >
                    {open
                        ? <PanelLeftClose className="size-5" />
                        : <PanelLeftOpen className="size-5" />
                    }
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <Avatar>
                                <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="font-normal">
                            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={logoutUrl} className="flex items-center gap-2 text-destructive focus:text-destructive">
                                <LogOut className="size-4" />
                                Se déconnecter
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <main
                className="mt-16 min-h-[calc(100vh-4rem)] overflow-auto p-6 transition-all duration-300"
                style={{ marginLeft: open ? SIDEBAR_W : 0 }}
            >
                <Outlet />
            </main>
        </div>
    );
}
