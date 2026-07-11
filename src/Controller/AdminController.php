<?php

declare(strict_types=1);

namespace App\Controller;

use App\Security\Voter\ArticleVoter;
use App\Security\Voter\MediaVoter;
use App\Security\Voter\UserVoter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminController extends AbstractController
{
    #[Route('/admin', name: 'app_admin')]
    #[Route('/admin/{path}', name: 'app_admin_path', requirements: ['path' => '.+'])]
    public function index(): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        return $this->render('admin/shell.html.twig', [
            'userEmail' => $user->getEmail(),
            'logoutUrl' => $this->generateUrl('app_security_logout'),
            'urls' => [
                'users' => $this->generateUrl('api_admin_users_list'),
                'articles' => $this->generateUrl('api_admin_articles_list'),
                'media' => $this->generateUrl('api_admin_media_list'),
                'mediaUpload' => $this->generateUrl('api_admin_media_upload'),
            ],
            'permissions' => [
                'canViewUsers' => $this->isGranted(UserVoter::VIEW),
                'canResetUserPassword' => $this->isGranted(UserVoter::RESET_PASSWORD),
                'canVerifyUser' => $this->isGranted(UserVoter::VERIFY),
                'canResendVerification' => $this->isGranted(UserVoter::RESEND_VERIFICATION),
                'canEditUserRoles' => $this->isGranted(UserVoter::EDIT_ROLES),
                'canDeleteUser' => $this->isGranted(UserVoter::DELETE),
                'canViewArticles' => $this->isGranted(ArticleVoter::VIEW),
                'canCreateArticle' => $this->isGranted(ArticleVoter::CREATE),
                'canEditArticle' => $this->isGranted(ArticleVoter::EDIT),
                'canDeleteArticle' => $this->isGranted(ArticleVoter::DELETE),
                'canPublishArticle' => $this->isGranted(ArticleVoter::PUBLISH),
                'canViewMedia' => $this->isGranted(MediaVoter::VIEW),
                'canUploadMedia' => $this->isGranted(MediaVoter::UPLOAD),
                'canDeleteMedia' => $this->isGranted(MediaVoter::DELETE),
            ],
        ]);
    }
}
