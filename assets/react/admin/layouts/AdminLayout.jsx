import React from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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

export default function AdminLayout({ userEmail = '', logoutUrl = '/deconnexion' }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
                    <h1 className="text-sm font-medium text-muted-foreground">
                        Panneau d'administration
                    </h1>

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

                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
