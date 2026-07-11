<?php

declare(strict_types=1);

namespace App\Controller\Api\Admin;

use App\Entity\Article;
use App\Repository\ArticleRepository;
use App\Security\Voter\ArticleVoter;
use App\Service\Manager\ArticleManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/articles')]
class ArticleController extends AbstractController
{
    public function __construct(
        private readonly ArticleManager $articleManager,
    ) {
    }

    #[Route('', name: 'api_admin_articles_list', methods: ['GET'])]
    public function list(Request $request, ArticleRepository $articleRepository): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::VIEW);

        $page = max(1, $request->query->getInt('page', 1));
        $pageSize = min(100, max(1, $request->query->getInt('pageSize', 20)));
        $query = $request->query->getString('q');

        $result = $articleRepository->searchPaginated('' !== $query ? $query : null, $page, $pageSize);

        return $this->json([
            'items' => array_map($this->serializeArticle(...), $result['items']),
            'total' => $result['total'],
            'page' => $page,
            'pageSize' => $pageSize,
        ]);
    }

    #[Route('', name: 'api_admin_articles_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::CREATE);

        /** @var array{title?: mixed, content?: mixed, excerpt?: mixed} $payload */
        $payload = $request->toArray();

        $title = is_string($payload['title'] ?? null) ? trim((string) $payload['title']) : '';
        if ('' === $title) {
            return $this->json(['message' => 'Le titre est obligatoire.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $content = is_array($payload['content'] ?? null) ? (array) $payload['content'] : [];
        $excerpt = is_string($payload['excerpt'] ?? null) && '' !== trim((string) $payload['excerpt'])
            ? trim((string) $payload['excerpt'])
            : null;

        /** @var \App\Entity\User $author */
        $author = $this->getUser();

        $article = $this->articleManager->create($title, $content, $author, $excerpt);
        if (null === $article) {
            return $this->json(['message' => 'Une erreur est survenue.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json($this->serializeArticle($article), Response::HTTP_CREATED);
    }

    #[Route('/upload-image', name: 'api_admin_articles_upload_image', methods: ['POST'])]
    public function uploadImage(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::EDIT);

        $file = $request->files->get('image');

        if (!$file instanceof UploadedFile) {
            return $this->json(['success' => 0, 'message' => 'Aucun fichier reçu.']);
        }

        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowed, true)) {
            return $this->json(['success' => 0, 'message' => 'Format non supporté (jpg, png, gif, webp uniquement).']);
        }

        if ($file->getSize() > 5 * 1024 * 1024) {
            return $this->json(['success' => 0, 'message' => 'Image trop lourde (max 5 Mo).']);
        }

        $filename = bin2hex(random_bytes(16)).'.'.$file->guessExtension();
        $file->move($this->getParameter('kernel.project_dir').'/public/uploads/articles', $filename);

        return $this->json(['success' => 1, 'file' => ['url' => '/uploads/articles/'.$filename]]);
    }

    #[Route('/{id}', name: 'api_admin_articles_get', methods: ['GET'])]
    public function get(Article $article): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::VIEW);

        return $this->json($this->serializeArticleFull($article));
    }

    #[Route('/{id}', name: 'api_admin_articles_update', methods: ['PUT'])]
    public function update(Article $article, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::EDIT, $article);

        /** @var array{title?: mixed, content?: mixed, excerpt?: mixed} $payload */
        $payload = $request->toArray();

        $title = is_string($payload['title'] ?? null) ? trim((string) $payload['title']) : '';
        if ('' === $title) {
            return $this->json(['message' => 'Le titre est obligatoire.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $content = is_array($payload['content'] ?? null) ? (array) $payload['content'] : [];
        $excerpt = is_string($payload['excerpt'] ?? null) && '' !== trim((string) $payload['excerpt'])
            ? trim((string) $payload['excerpt'])
            : null;

        if (!$this->articleManager->update($article, $title, $content, $excerpt)) {
            return $this->json(['message' => 'Une erreur est survenue.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json($this->serializeArticleFull($article));
    }

    #[Route('/{id}', name: 'api_admin_articles_delete', methods: ['DELETE'])]
    public function delete(Article $article): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::DELETE, $article);

        if (!$this->articleManager->delete($article)) {
            return $this->json(['message' => 'Une erreur est survenue.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/publish', name: 'api_admin_articles_publish', methods: ['POST'])]
    public function publish(Article $article): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::PUBLISH, $article);

        if ($article->isPublished()) {
            return $this->json(['message' => 'Cet article est déjà publié.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$this->articleManager->publish($article)) {
            return $this->json(['message' => 'Une erreur est survenue.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json($this->serializeArticle($article));
    }

    #[Route('/{id}/unpublish', name: 'api_admin_articles_unpublish', methods: ['POST'])]
    public function unpublish(Article $article): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::PUBLISH, $article);

        if ($article->isDraft()) {
            return $this->json(['message' => 'Cet article est déjà en brouillon.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$this->articleManager->unpublish($article)) {
            return $this->json(['message' => 'Une erreur est survenue.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json($this->serializeArticle($article));
    }

    /**
     * @return array{id: int|null, title: string, slug: string, excerpt: string|null, status: string, authorEmail: string|null, createdAt: string, updatedAt: string, publishedAt: string|null}
     */
    private function serializeArticle(Article $article): array
    {
        return [
            'id' => $article->getId(),
            'title' => $article->getTitle(),
            'slug' => $article->getSlug(),
            'excerpt' => $article->getExcerpt(),
            'status' => $article->getStatus(),
            'authorEmail' => $article->getAuthor()->getEmail(),
            'createdAt' => $article->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $article->getUpdatedAt()->format(\DateTimeInterface::ATOM),
            'publishedAt' => $article->getPublishedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }

    /**
     * @return array{id: int|null, title: string, slug: string, excerpt: string|null, content: array<mixed>, status: string, authorEmail: string|null, createdAt: string, updatedAt: string, publishedAt: string|null}
     */
    private function serializeArticleFull(Article $article): array
    {
        return array_merge($this->serializeArticle($article), ['content' => $article->getContent()]);
    }
}
