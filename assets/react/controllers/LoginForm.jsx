import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, getErrorMessage } from '../utils/api';
import { resolveUrl } from '../utils/url';

export default function LoginForm({
    loginUrl          = '/api/auth/login',
    redirectUrl       = '/',
    forgotPasswordUrl = '/mot-de-passe-oublie',
    registerUrl       = '/inscription',
}) {
    const [email, setEmail]     = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post(resolveUrl(loginUrl), { email, password });
            window.location.href = redirectUrl;
        } catch (err) {
            setError(getErrorMessage(err, 'Erreur de connexion.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* ── Colonne gauche : formulaire ── */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                {/* Logo */}
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="/" className="flex items-center gap-2 font-semibold text-foreground">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                            B
                        </div>
                        BleuMont
                    </a>
                </div>

                {/* Form centré verticalement */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs space-y-6">
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
                            <p className="text-sm text-muted-foreground">
                                Entrez vos identifiants pour accéder à votre compte
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <a
                                        href={resolveUrl(forgotPasswordUrl)}
                                        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                                    >
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Connexion…' : 'Se connecter'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground">
                            Pas encore de compte ?{' '}
                            <a
                                href={resolveUrl(registerUrl)}
                                className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                                S'inscrire
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Colonne droite : panneau décoratif ── */}
            <div className="relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center bg-zinc-900 text-zinc-50 p-12">
                <blockquote className="max-w-sm space-y-4 text-center">
                    <p className="text-xl font-medium leading-relaxed">
                        "Une interface simple et efficace pour gérer votre activité au quotidien."
                    </p>
                    <footer className="text-sm text-zinc-400">BleuMont</footer>
                </blockquote>
            </div>
        </div>
    );
}
