import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, extractValidationErrors, getErrorMessage } from '../utils/api';
import { resolveUrl } from '../utils/url';

export default function ForgotPasswordForm({
    requestUrl = '/api/auth/reset-password/request',
    confirmUrl = '/api/auth/reset-password/confirm',
    loginUrl   = '/connexion',
}) {
    const [step, setStep]                       = useState('request'); // 'request' | 'confirm' | 'done'
    const [email, setEmail]                     = useState('');
    const [code, setCode]                       = useState('');
    const [newPassword, setNewPassword]         = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [errors, setErrors]                   = useState([]);
    const [loading, setLoading]                 = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);
        try {
            await api.post(resolveUrl(requestUrl), { email });
            setStep('confirm');
        } catch (err) {
            const violations = extractValidationErrors(err);
            setErrors(violations.length > 0 ? violations : [getErrorMessage(err, 'Une erreur est survenue.')]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);
        try {
            await api.post(resolveUrl(confirmUrl), { email, code, newPassword, newPasswordConfirm });
            setStep('done');
        } catch (err) {
            const violations = extractValidationErrors(err);
            setErrors(violations.length > 0 ? violations : [getErrorMessage(err, 'Une erreur est survenue.')]);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'done') {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Mot de passe réinitialisé</CardTitle>
                    <CardDescription>Votre mot de passe a été mis à jour avec succès.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <a href={resolveUrl(loginUrl)}>Se connecter</a>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (step === 'confirm') {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Entrez votre code</CardTitle>
                    <CardDescription>
                        Un code à 6 chiffres a été envoyé à <strong>{email}</strong>. Il est valable 15 minutes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleConfirm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fp-code">Code de vérification</Label>
                            <Input
                                id="fp-code"
                                type="text"
                                inputMode="numeric"
                                pattern="\d{6}"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                autoComplete="one-time-code"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fp-password">Nouveau mot de passe</Label>
                            <Input
                                id="fp-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="8 caractères minimum"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fp-password-confirm">Confirmer le mot de passe</Label>
                            <Input
                                id="fp-password-confirm"
                                type="password"
                                value={newPasswordConfirm}
                                onChange={(e) => setNewPasswordConfirm(e.target.value)}
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
                            {loading ? 'Validation…' : 'Réinitialiser le mot de passe'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => { setStep('request'); setErrors([]); }}
                        >
                            Changer d'adresse e-mail
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Mot de passe oublié</CardTitle>
                <CardDescription>Entrez votre adresse e-mail pour recevoir un code de réinitialisation.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleRequest} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fp-email">Email</Label>
                        <Input
                            id="fp-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            autoComplete="email"
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
                        {loading ? 'Envoi…' : 'Envoyer le code'}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        <a href={resolveUrl(loginUrl)} className="underline underline-offset-4 hover:text-primary">
                            Retour à la connexion
                        </a>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
