import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, extractValidationErrors, getErrorMessage } from '../utils/api';
import { resolveUrl } from '../utils/url';

export default function RegisterForm({
    registerUrl = '/api/auth/inscription',
    resendUrl   = '/api/auth/verification-email/renvoyer',
    loginUrl    = '/connexion',
}) {
    const [email, setEmail]                     = useState('');
    const [password, setPassword]               = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors]                   = useState([]);
    const [loading, setLoading]                 = useState(false);
    const [done, setDone]                       = useState(false);
    const [resent, setResent]                   = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);
        try {
            await api.post(resolveUrl(registerUrl), { email, password, passwordConfirm });
            setDone(true);
        } catch (err) {
            const violations = extractValidationErrors(err);
            setErrors(
                violations.length > 0
                    ? violations
                    : [getErrorMessage(err, "Erreur lors de l'inscription.")],
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResent(false);
        try {
            await api.post(resolveUrl(resendUrl), { email });
            setResent(true);
        } catch {
            setResent(true);
        }
    };

    const decorativePanel = (
        <div style={{ viewTransitionName: 'auth-panel' }} className="relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center bg-zinc-900 text-zinc-50 p-12">
            <blockquote className="max-w-sm space-y-4 text-center">
                <p className="text-xl font-medium leading-relaxed">
                    "Une interface simple et efficace pour gérer votre activité au quotidien."
                </p>
                <footer className="text-sm text-zinc-400">BleuMont</footer>
            </blockquote>
        </div>
    );

    if (done) {
        return (
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <a href="/" className="flex items-center gap-2 font-semibold text-foreground">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                                B
                            </div>
                            BleuMont
                        </a>
                    </div>

                    <div className="flex flex-1 items-center justify-center">
                        <div style={{ viewTransitionName: 'auth-form' }} className="w-full max-w-sm space-y-6">
                            <div className="space-y-2 text-center">
                                <h1 className="text-2xl font-bold tracking-tight">Vérifiez votre boîte e-mail</h1>
                                <p className="text-sm text-muted-foreground">
                                    Un lien d'activation a été envoyé à <strong>{email}</strong>.
                                    Cliquez dessus pour activer votre compte.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground text-center">
                                    Vous n'avez rien reçu ?
                                </p>
                                {resent && (
                                    <p className="text-sm text-green-600 text-center">E-mail renvoyé !</p>
                                )}
                                <Button variant="outline" className="w-full" onClick={handleResend}>
                                    Renvoyer l'e-mail
                                </Button>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                <a
                                    href={resolveUrl(loginUrl)}
                                    className="font-medium text-foreground underline-offset-4 hover:underline"
                                >
                                    Retour à la connexion
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                {decorativePanel}
            </div>
        );
    }

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
                    <div style={{ viewTransitionName: 'auth-form' }} className="w-full max-w-sm space-y-6">
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">Inscription</h1>
                            <p className="text-sm text-muted-foreground">
                                Créez votre compte pour accéder à la plateforme
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reg-email">Email</Label>
                                <Input
                                    id="reg-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reg-password">Mot de passe</Label>
                                <Input
                                    id="reg-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="8 caractères minimum"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reg-password-confirm">Confirmer le mot de passe</Label>
                                <Input
                                    id="reg-password-confirm"
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            {errors.length > 0 && (
                                <ul className="space-y-1">
                                    {errors.map((msg, i) => (
                                        <li key={i} className="text-sm text-destructive">{msg}</li>
                                    ))}
                                </ul>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Inscription…' : "S'inscrire"}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground">
                            Déjà un compte ?{' '}
                            <a
                                href={resolveUrl(loginUrl)}
                                className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                                Se connecter
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Colonne droite : panneau décoratif ── */}
            {decorativePanel}
        </div>
    );
}
