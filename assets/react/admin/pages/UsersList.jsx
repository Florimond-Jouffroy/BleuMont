import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersList() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Utilisateurs</h2>
                <p className="text-muted-foreground">Gestion des comptes utilisateurs.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Liste des utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Aucun utilisateur à afficher.</p>
                </CardContent>
            </Card>
        </div>
    );
}
