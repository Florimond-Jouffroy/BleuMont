import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, extractValidationErrors, getErrorMessage } from '../utils/api';
import { resolveUrl } from '../utils/url';

export default function RegisterForm({ registerUrl = '/api/auth/register', redirectUrl = '/' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);
        try {
            await api.post(resolveUrl(registerUrl), { email, password, passwordConfirm });
            window.location.href = redirectUrl;
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

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Inscription</CardTitle>
                <CardDescription>Créez votre compte</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    );
}
