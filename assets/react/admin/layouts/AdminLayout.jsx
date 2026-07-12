import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppSidebar from './AppSidebar';

const pageTitles = {
    '/dashboard':          'Dashboard',
    '/utilisateurs':       'Utilisateurs',
    '/articles':           'Articles',
    '/medias':             'Médiathèque',
    '/categories':         'Catégories',
    '/commandes':          'Commandes',
    '/factures':           'Factures',
    '/produits':           'Produits',
    '/categories-produits': 'Catégories produits',
    '/livraison':          'Livraison',
    '/parametres':         'Paramètres',
};

function getTitle(pathname) {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (/^\/articles\/\d+\/modifier$/.test(pathname)) return "Modifier l'article";
    if (/^\/produits\/\d+\/modifier$/.test(pathname)) return 'Modifier le produit';
    if (/^\/commandes\/\d+$/.test(pathname)) return 'Détail commande';
    return 'Administration';
}

export default function AdminLayout({ userEmail = '', logoutUrl = '/deconnexion' }) {
    const { pathname } = useLocation();
    const title = getTitle(pathname);

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar userEmail={userEmail} logoutUrl={logoutUrl} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <span className="text-sm font-medium text-foreground">{title}</span>
                        <a
                            href="/"
                            className="ml-auto flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <Globe className="size-4" />
                            <span>Voir le site</span>
                        </a>
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
