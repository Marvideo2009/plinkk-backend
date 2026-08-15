import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { prisma } from '@plinkk/prisma';
import { resolvePlinkkPage, filterScheduledLinks } from '@plinkk/shared';

export const load: PageServerLoad = async ({ params, request, locals }) => {
    const { slug } = params;

    const reserved = ['public', 'api', 'dashboard', 'login', 'logout', 'register', 'totp', 'users', 'patch-notes', 'pricing', 'features', 'about', 'terms', 'cgv', 'privacy', 'cookies', 'legal', 'partners', 'docs'];
    if (reserved.includes(slug)) {
        throw error(404, 'Not found');
    }

    try {
        const resolved = await resolvePlinkkPage(slug, undefined, {
            headers: Object.fromEntries(request.headers),
            ip: request.headers.get('x-forwarded-for') || '127.0.0.1'
        } as any);

        if (resolved.status !== 200) {
            throw error(resolved.status || 404, 'Page not found');
        }

        const u = await prisma.user.findUnique({
            where: { id: resolved.user.id },
            select: { email: true }
        });
        if (u?.email) {
            const ban = await prisma.bannedEmail.findFirst({
                where: { email: u.email, revoquedAt: null }
            });
            if (ban) {
                throw error(403, 'User is banned');
            }
        }

        if (resolved.isPasswordProtected && !resolved.isOwner) {
            return {
                isPasswordProtected: true,
                page: JSON.parse(JSON.stringify(resolved.page)),
                slug
            };
        }

        const allLinks = await prisma.link.findMany({
            where: { plinkkId: resolved.page.id, userId: resolved.user.id },
            orderBy: { index: 'asc' }
        });
        const links = filterScheduledLinks(allLinks);

        const settings = await prisma.plinkkSettings.findUnique({
            where: { plinkkId: resolved.page.id }
        });

        const labels = await prisma.label.findMany({ where: { userId: resolved.user.id, plinkkId: resolved.page.id }})

        const bgColor = await prisma.backgroundColor.findMany({ where: { userId: resolved.user.id, plinkkId: resolved.page.id }})

        const neonColor = await prisma.neonColor.findMany({ where: { userId: resolved.user.id, plinkkId: resolved.page.id }})

        const socialIcon = await prisma.socialIcon.findMany({ where: { userId: resolved.user.id, plinkkId: resolved.page.id }})

        const statusBar = await prisma.plinkkStatusbar.findUnique({ where: { plinkkId: resolved.page.id } })

        const category = await prisma.category.findMany({ where: { plinkkId: resolved.page.id }, orderBy: { order: "asc" }})

        return {
            page: resolved.page,
            user: resolved.user,
            links: links,
            labels: labels,
            bgColor: bgColor,
            neonColor: neonColor,
            socialIcon: socialIcon,
            statusBar: statusBar,
            category: category,
            settings: settings,
            isOwner: resolved.isOwner,
            publicPath: resolved.page.slug || resolved.user.id
        };
    } catch (e) {
        if (e && typeof e === 'object' && 'status' in e) throw e;
        console.error('Error resolving plinkk page:', e);
        throw error(500, 'Internal Server Error');
    }
};
