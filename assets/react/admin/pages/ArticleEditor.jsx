import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Globe, GlobeLock, ImageIcon, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BlockEditor from '../components/BlockEditor';
import BlockRenderer from '../components/BlockRenderer';
import MediaPickerModal from '../components/MediaPickerModal';
import { api, getErrorMessage } from '../../utils/api';

export default function ArticleEditor({ permissions = {}, urls = {} }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = id !== undefined;

    const [title, setTitle]                 = useState('');
    const [excerpt, setExcerpt]             = useState('');
    const [content, setContent]             = useState({ blocks: [] });
    const [status, setStatus]               = useState('draft');
    const [loading, setLoading]             = useState(isEdit);
    const [contentLoaded, setContentLoaded] = useState(!isEdit);
    const [saving, setSaving]               = useState(false);
    const [publishing, setPublishing]       = useState(false);
    const [feedback, setFeedback]           = useState(null);
    const [savedId, setSavedId]             = useState(id ? parseInt(id, 10) : null);
    const [activeTab, setActiveTab]         = useState('edit');
    const [pickerOpen, setPickerOpen]       = useState(false);

    const editorRef = useRef(null);

    useEffect(() => {
        if (!isEdit) return;

        api.get(`/api/admin/articles/${id}`)
            .then((data) => {
                setTitle(data.title);
                setExcerpt(data.excerpt ?? '');
                setContent(data.content ?? { blocks: [] });
                setStatus(data.status);
                setContentLoaded(true);
            })
            .catch(() => setFeedback({ type: 'error', message: "Impossible de charger l'article." }))
            .finally(() => setLoading(false));
    }, [id]);

    // Called by BlockEditor's custom uploader (file selected via Editor.js image tool)
    const handleUploadFile = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const media = await api.post(urls.mediaUpload ?? '/api/admin/media', formData);
            return { success: 1, file: { url: media.url } };
        } catch {
            return { success: 0, message: 'Upload échoué.' };
        }
    }, [urls.mediaUpload]);

    // Called when an image is selected from the media picker modal
    const handleLibrarySelect = useCallback((url) => {
        editorRef.current?.insertImage(url);
        setPickerOpen(false);
    }, []);

    const handleSave = async () => {
        const trimmed = title.trim();
        if (!trimmed) {
            setFeedback({ type: 'error', message: 'Le titre est obligatoire.' });
            return;
        }

        setSaving(true);
        setFeedback(null);

        try {
            const payload = { title: trimmed, content, excerpt: excerpt.trim() || null };

            if (savedId) {
                const updated = await api.put(`/api/admin/articles/${savedId}`, payload);
                setStatus(updated.status);
                setFeedback({ type: 'success', message: 'Article enregistré.' });
            } else {
                const created = await api.post(urls.articles ?? '/api/admin/articles', payload);
                setSavedId(created.id);
                setStatus(created.status);
                navigate(`/articles/${created.id}/edit`, { replace: true });
                setFeedback({ type: 'success', message: 'Article créé.' });
            }
        } catch (err) {
            setFeedback({ type: 'error', message: getErrorMessage(err, 'Erreur lors de la sauvegarde.') });
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async () => {
        if (!savedId) {
            setFeedback({ type: 'error', message: "Enregistrez d'abord l'article avant de le publier." });
            return;
        }

        setPublishing(true);
        setFeedback(null);

        const endpoint = status === 'published'
            ? `/api/admin/articles/${savedId}/unpublish`
            : `/api/admin/articles/${savedId}/publish`;

        try {
            const updated = await api.post(endpoint);
            setStatus(updated.status);
            setFeedback({
                type: 'success',
                message: updated.status === 'published' ? 'Article publié.' : 'Article repassé en brouillon.',
            });
        } catch (err) {
            setFeedback({ type: 'error', message: getErrorMessage(err) });
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-32 rounded bg-muted" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/articles')}>
                        <ArrowLeft className="size-4" />
                        <span className="sr-only">Retour</span>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isEdit ? "Modifier l'article" : 'Nouvel article'}
                        </h2>
                        <Badge variant={status === 'published' ? 'default' : 'secondary'} className="mt-1">
                            {status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {permissions.canPublishArticle && savedId && (
                        <Button variant="outline" onClick={handleTogglePublish} disabled={publishing || saving}>
                            {status === 'published'
                                ? <><GlobeLock className="size-4" /> Dépublier</>
                                : <><Globe className="size-4" /> Publier</>
                            }
                        </Button>
                    )}

                    {(permissions.canCreateArticle || permissions.canEditArticle) && (
                        <Button onClick={handleSave} disabled={saving || publishing}>
                            <Save className="size-4" />
                            {saving ? 'Enregistrement…' : 'Enregistrer'}
                        </Button>
                    )}
                </div>
            </div>

            {feedback && (
                <p className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                    {feedback.message}
                </p>
            )}

            {/* Titre */}
            <div className="space-y-2">
                <Label htmlFor="article-title">Titre</Label>
                <Input
                    id="article-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de l'article"
                    className="text-lg"
                />
            </div>

            {/* Extrait */}
            <div className="space-y-2">
                <Label htmlFor="article-excerpt">
                    Extrait <span className="text-muted-foreground font-normal">(optionnel)</span>
                </Label>
                <Textarea
                    id="article-excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Courte description affichée en aperçu…"
                    rows={3}
                    maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{excerpt.length} / 500</p>
            </div>

            {/* Contenu + Aperçu */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Contenu</Label>

                    <div className="flex items-center gap-2">
                        {/* Bouton bibliothèque (visible uniquement en mode édition) */}
                        {activeTab === 'edit' && permissions.canUploadMedia && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPickerOpen(true)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ImageIcon className="size-4" />
                                Bibliothèque
                            </Button>
                        )}

                        {/* Onglets Édition / Aperçu */}
                        <div className="inline-flex rounded-md border text-xs">
                            <button
                                type="button"
                                onClick={() => setActiveTab('edit')}
                                className={`px-3 py-1.5 rounded-l-md transition-colors ${
                                    activeTab === 'edit'
                                        ? 'bg-muted font-medium'
                                        : 'hover:bg-muted/50 text-muted-foreground'
                                }`}
                            >
                                Édition
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('preview')}
                                className={`px-3 py-1.5 rounded-r-md transition-colors ${
                                    activeTab === 'preview'
                                        ? 'bg-muted font-medium'
                                        : 'hover:bg-muted/50 text-muted-foreground'
                                }`}
                            >
                                Aperçu
                            </button>
                        </div>
                    </div>
                </div>

                {contentLoaded && (
                    <>
                        <div className={activeTab === 'edit' ? 'block' : 'hidden'}>
                            <BlockEditor
                                ref={editorRef}
                                key={savedId ?? 'new'}
                                value={content}
                                onChange={setContent}
                                onUploadFile={handleUploadFile}
                            />
                        </div>

                        {activeTab === 'preview' && (
                            <div className="min-h-64 rounded-md border bg-background px-6 py-5">
                                {title.trim() && (
                                    <h1 className="text-3xl font-bold mb-6">{title}</h1>
                                )}
                                {excerpt.trim() && (
                                    <p className="text-muted-foreground italic mb-6 text-base leading-relaxed border-l-4 border-border pl-4">
                                        {excerpt}
                                    </p>
                                )}
                                <BlockRenderer content={content} />
                            </div>
                        )}
                    </>
                )}
            </div>

            <MediaPickerModal
                open={pickerOpen}
                onSelect={handleLibrarySelect}
                onCancel={() => setPickerOpen(false)}
                urls={urls}
            />
        </div>
    );
}
