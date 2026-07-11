import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Vue d'ensemble de l'application.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Utilisateurs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">—</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
