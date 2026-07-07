import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronsUpDown, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users',     icon: Users,            label: 'Utilisateurs' },
];

function getInitials(email) {
    if (!email) return '?';
    const local = email.split('@')[0];
    const parts = local.split(/[._-]/);
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : local.slice(0, 2).toUpperCase();
}

function NavItem({ to, icon: Icon, label }) {
    const { pathname } = useLocation();
    const isActive = pathname === to || pathname.startsWith(to + '/');

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                <NavLink to={to}>
                    <Icon />
                    <span>{label}</span>
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export default function AppSidebar({ userEmail = '', logoutUrl = '/deconnexion' }) {
    return (
        <Sidebar collapsible="icon">
            {/* ── Header : logo ── */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild tooltip="BleuMont">
                            <a href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                                    B
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">BleuMont</span>
                                    <span className="text-xs text-sidebar-foreground/70">Administration</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Content : navigation ── */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <NavItem key={item.to} {...item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer : utilisateur ── */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    tooltip={userEmail}
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="size-8 rounded-lg shrink-0">
                                        <AvatarFallback className="rounded-lg text-xs">
                                            {getInitials(userEmail)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5 leading-none text-left">
                                        <span className="truncate text-sm font-medium">
                                            {userEmail?.split('@')[0]}
                                        </span>
                                        <span className="truncate text-xs text-sidebar-foreground/70">
                                            {userEmail}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 shrink-0" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="end"
                                sideOffset={4}
                                className="w-56"
                            >
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
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
