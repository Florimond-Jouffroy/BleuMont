import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Utilisateurs' },
];

export default function Sidebar({ open }) {
    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r bg-background transition-transform duration-300',
                open ? 'translate-x-0' : '-translate-x-full',
            )}
        >
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-semibold tracking-tight">Administration</span>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-3">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )
                        }
                    >
                        <Icon className="size-4 shrink-0" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <Separator />
            <div className="p-4 text-xs text-muted-foreground">
                BleuMont — Admin
            </div>
        </aside>
    );
}
