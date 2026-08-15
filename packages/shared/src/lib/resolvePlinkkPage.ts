import { Plinkk, Prisma, prisma, User, Visibility } from "@plinkk/prisma";
import { FastifyRequest } from "fastify";
import "@fastify/secure-session";
import { SafeUser, toSafeUser } from "../types/user";

export function parseIdentifier(id?: string | null): { kind: 'default' | 'index' | 'slug'; value?: number | string } {
  if (!id || id === '' || id === 'default') return { kind: 'default' };
  if (id === '0') return { kind: 'default' };
  if (/^\d+$/.test(id)) return { kind: 'index', value: Number(id) };
  return { kind: 'slug', value: id };
}

export type ResolvePlinkkPageResult =
  | { status: 404; error: 'user_not_found' | 'page_not_found' }
  | { status: 403; error: 'page_inactive' | 'forbidden' }
  | {
      status: 200;
      user: SafeUser;
      page: Plinkk;
      isOwner: boolean;
      isPasswordProtected: boolean;
    };

export async function resolvePlinkkPage(username: string, identifier: string | undefined, request?: FastifyRequest): Promise<ResolvePlinkkPageResult> {
  let user = await prisma.user.findUnique({ where: { id: username } });
  if (!user) {
    user = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { id: username },
          { userName: { equals: username, mode: 'insensitive' } }
        ]
      },
    });
  }
  if (!user) return { status: 404 as const, error: 'user_not_found' };

  const parsed = parseIdentifier(identifier);
  let page = await (async (): Promise<Plinkk | null> => {
    if (parsed.kind === 'default') {
      const byDefault = await prisma.plinkk.findFirst({ where: { userId: user.id, isDefault: true } });
      if (byDefault) return byDefault;
      return prisma.plinkk.findFirst({ where: { userId: user.id, index: 0 } });
    }
    if (parsed.kind === 'index') {
      return prisma.plinkk.findFirst({ where: { userId: user.id, index: parsed.value as number } });
    }
    return prisma.plinkk.findFirst({ where: { userId: user.id, slug: parsed.value as string } });
  })();

  if (!page) return { status: 404 as const, error: 'page_not_found' };
  if (!page.isActive) return { status: 403 as const, error: 'page_inactive' };
  const isPrivate = page.visibility === Visibility.PRIVATE;
  const sessionUserId = request && request.session ? (request.session.get('data') as string | undefined) : undefined;
  const isOwner = !!sessionUserId && sessionUserId === user.id;

  if (isPrivate && !isOwner) {
    if (!user.isPublic) {
      return { status: 403 as const, error: 'forbidden' };
    }
  }

  const isPasswordProtected = !!page.passwordHash;

  const isPreview = (request?.query as { preview: string })?.preview === '1';

  const safeUser = toSafeUser(user)

  return { status: 200 as const, user: safeUser, page, isOwner, isPasswordProtected };
}
