import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, getErrorMessage } from '../../utils/api';

export default function ProductCategoryManager({ permissions = {}, urls = {} }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [newName, setNewName]       = useState('');
    const [creating, setCreating]     = useState(false);
    const [feedback, setFeedback]     = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting]     = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editName, setEditName]     = useState('');
    const [saving, setSaving]         = useState(false);

    const fetchCategories = async () => {
        try {
            const data = await api.get(urls.productCategories ?? '/api/admin/categories-produits');
            setCategories(data);
        } catch (err) {
            setFeedback({ type: 'error', message: getErrorMessage(err) });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;
        setCreating(true);
        setFeedback(null);
        try {
            await api.post(urls.productCategories ?? '/api/admin/categories-produits', { name });
            setNewName('');
            await fetchCategories();
            setFeedback({ type: 'success', message: `Catégorie « ${name} » créée.` });
        } catch (err) {
            setFeedback({ type: 'error', message: getErrorMessage(err) });
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        const name = editName.trim();
        if (!name) return;
        setSaving(true);
        setFeedback(null);
        try {
            await api.put(`/api/admin/categories-produits/${editTarget.id}`, { name });
            setEditTarget(null);
            await fetchCategories();
            setFeedback({ type: 'success', message: `Catégorie renommée en « ${name} ».` });
        } catch (err) {
            setFeedback({ type: 'error', message: getErrorMessage(err) });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setFeedback(null);
        try {
            await api.delete(`/api/admin/categories-produits/${deleteTarget.id}`);
            setFeedback({ type: 'success', message: `Catégorie « ${deleteTarget.name} » supprimée.` });
            setDeleteTarget(null);
            await fetchCategories();
        } catch (err) {
            setFeedback({ type: 'error', message: getErrorMessage(err) });
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Catégories produits</h2>
                <p className="text-muted-foreground">Organisez votre catalogue par catégorie.</p>
            </div>

            {permissions.canCreateProductCategory && (
                <form onSubmit={handleCreate} className="flex items-end gap-3 max-w-sm">
                    <div className="flex-1 space-y-1.5">
                        <Label htmlFor="pc-name">Nouvelle catégorie</Label>
                        <Input
                            id="pc-name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ex : Vêtements"
                            disabled={creating}
                        />
                    </div>
                    <Button type="submit" disabled={creating || !newName.trim()}>
                        <Plus className="size-4" />
                        {creating ? 'Création…' : 'Ajouter'}
                    </Button>
                </form>
            )}

            {feedback && (
                <p className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                    {feedback.message}
                </p>
            )}

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                    <Tag className="size-10 opacity-30" />
                    <p className="text-sm">Aucune catégorie pour l'instant.</p>
                </div>
            ) : (
                <div className="rounded-md border divide-y">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="font-medium">{cat.name}</span>
                                <span className="text-xs text-muted-foreground font-mono">{cat.slug}</span>
                                {!cat.isActive && <Badge variant="outline" className="text-xs">Inactif</Badge>}
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary">
                                    {cat.productCount} produit{cat.productCount !== 1 ? 's' : ''}
                                </Badge>
                                {permissions.canEditProductCategory && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => { setEditTarget(cat); setEditName(cat.name); }}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                )}
                                {permissions.canDeleteProductCategory && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => setDeleteTarget(cat)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit dialog */}
            <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
                {editTarget && (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Renommer la catégorie</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-1.5 py-2">
                            <Label htmlFor="edit-cat-name">Nom</Label>
                            <Input
                                id="edit-cat-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                                disabled={saving}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>Annuler</Button>
                            <Button onClick={handleEdit} disabled={saving || !editName.trim()}>
                                {saving ? 'Enregistrement…' : 'Enregistrer'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                {deleteTarget && (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer la catégorie</DialogTitle>
                            <DialogDescription>
                                La catégorie <strong>{deleteTarget.name}</strong> sera supprimée.
                                {deleteTarget.productCount > 0 && (
                                    <> Les <strong>{deleteTarget.productCount} produit{deleteTarget.productCount > 1 ? 's' : ''}</strong> associés ne seront pas supprimés.</>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Annuler</Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Suppression…' : 'Supprimer'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}
