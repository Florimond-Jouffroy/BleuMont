import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, getErrorMessage } from '../../utils/api';

export default function Settings({ urls = {} }) {
    const [settings, setSettings]   = useState(null);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [feedback, setFeedback]   = useState(null);

    const fetchSettings = async () => {
        try {
            const data = await api.get(urls.settings ?? '/api/admin/parametres');
            setSettings(data);
        } catch {
            setFeedback({ type: 'error', message: 'Impossible de charger les paramètres.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleTriggerChange = async (value) => {
        setSaving(true);
        setFeedback(null);
        try {
            const data = await api.patch(urls.settings ?? '/api/admin/parametres', { invoiceTrigger: value });
            setSettings(data);
            setFeedback({ type: 'success', message: 'Paramètre enregistré.' });
        } catch (err) {
            setFeedback({ type: 'error', message: getErrorMessage(err) });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-64 rounded bg-muted" />
                <div className="h-40 rounded bg-muted" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
                <p className="text-sm text-muted-foreground mt-1">Configuration générale de la boutique</p>
            </div>

            {feedback && (
                <p className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                    {feedback.message}
                </p>
            )}

            {/* Facturation */}
            <div className="rounded-lg border">
                <div className="px-5 py-4 border-b bg-muted/40">
                    <h3 className="font-semibold text-sm">Facturation</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Configurer quand les factures sont générées automatiquement</p>
                </div>
                <div className="p-5 space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Déclencheur de la facture</p>

                        <div className="space-y-2">
                            {[
                                {
                                    value: 'on_order',
                                    label: 'À la création de la commande',
                                    description: 'La facture est générée dès que le client confirme sa commande (statut En attente). Recommandé pour les paiements immédiats.',
                                },
                                {
                                    value: 'on_confirm',
                                    label: "Lors de la confirmation par l'admin",
                                    description: "La facture n'est générée que quand vous passez la commande en statut Confirmée. Recommandé si vous validez les commandes manuellement.",
                                },
                            ].map(({ value, label, description }) => {
                                const active = settings?.invoiceTrigger === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        disabled={saving}
                                        onClick={() => !active && handleTriggerChange(value)}
                                        className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${
                                            active
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-muted-foreground/40'
                                        } ${saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                active ? 'border-primary' : 'border-muted-foreground/40'
                                            }`}>
                                                {active && <div className="size-2 rounded-full bg-primary" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{label}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-md bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
                        <strong>Note :</strong> La TVA appliquée sur les factures est de <strong>20%</strong>.
                        Les informations de l'entreprise (nom, adresse, SIRET) sont configurables dans <code>config/services.yaml</code> sous la clé <code>app.company</code>.
                    </div>
                </div>
            </div>
        </div>
    );
}
