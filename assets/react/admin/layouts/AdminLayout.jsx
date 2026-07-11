import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppSidebar from './AppSidebar';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/users':     'Utilisateurs',
};

export default function AdminLayout({ userEmail = '', logoutUrl = '/deconnexion' }) {
    const { pathname } = useLocation();
    const title = pageTitles[pathname] ?? 'Administration';

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar userEmail={userEmail} logoutUrl={logoutUrl} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <span className="text-sm font-medium text-foreground">{title}</span>
                    </header>

                    {/* key sur le pathname : relance l'animation d'entrée à chaque changement de page */}
                    <div
                        key={pathname}
                        className="flex flex-1 flex-col gap-4 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
