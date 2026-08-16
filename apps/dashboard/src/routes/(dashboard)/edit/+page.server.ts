import { prisma } from "../../../lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import {
  getPlinkksByUserId,
  getSelectedPlinkk,
  getPlinkkWithDetails,
  formatPlinkkForView,
  formatPagesForView,
} from "../../../services/plinkkService";
import { getUserLimits, generateTheme } from "@plinkk/shared";
import crypto from "crypto";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) throw redirect(302, "/login");

  const plinkkId = url.searchParams.get("plinkkId");
  const pages = await getPlinkksByUserId(user.id);
  const selectedSimple = getSelectedPlinkk(pages, plinkkId || undefined);

  let selectedForView: any = null;
  if (selectedSimple) {
    const selected = await getPlinkkWithDetails(selectedSimple.id, user.id);
    if (selected) {
      selectedForView = formatPlinkkForView(selected);
    }
  }

  if (!selectedForView && pages.length === 0) {
    throw redirect(302, "/onboarding");
  }

  if (!selectedForView) {
    throw redirect(302, "/");
  }

  const autoOpenPlinkkModal = !plinkkId && pages.length > 1;

  const currentPlinkkId = selectedForView.id;
  const [linksCount, categories, themesData] = await Promise.all([
    prisma.link.count({ where: { userId: user.id } }),
    prisma.category.findMany({
      where: { plinkkId: currentPlinkkId },
      orderBy: { order: "asc" },
    }),
    generateTheme(user.id),
  ]);

  const maxLinks = getUserLimits(user).maxLinks;

  const emailHash = crypto
    .createHash("sha256")
    .update((user.email || "").trim().toLowerCase())
    .digest("hex");
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=404`;

  return {
    plinkk: selectedForView,
    pages: formatPagesForView(pages),
    autoOpenPlinkkModal,
    linksCount,
    maxLinks,
    gravatarUrl,
    categories,
    themes: themesData,
    frontendUrl: process.env.FRONTEND_URL || "https://plinkk.fr",
  };
};

export const actions: Actions = {
  update: async ({ request, locals, url }) => {
    const user = locals.user;
    if (!user) return { success: false, error: "Unauthorized" };

    const data = await request.formData();
    const field = data.get("field") as string;
    let value = data.get("value");

    try {
      if (typeof value === "string") value = JSON.parse(value);
    } catch {}

    const plinkkId = url.searchParams.get("plinkkId");
    const pages = await getPlinkksByUserId(user.id);
    const selected = getSelectedPlinkk(pages, plinkkId || undefined);

    if (!selected) return { success: false, error: "Plinkk not found" };

    try {
      const settingsFields = [
        "affichageEmail",
        "backgroundType",
        "backgroundImage",
        "backgroundVideo",
        "canvaEnable",
        "selectedCanvasIndex",
        "selectedThemeIndex",
        "selectedAnimationIndex",
        "selectedAnimationButtonIndex",
        "selectedAnimationBackgroundIndex",
        "fontFamily",
        "buttonStyle",
        "layoutOrder",
        "statusVisible",
        "statusEmoji",
        "statusText",
        "delayAnimationButton",
        "animationDuration",
        "showVerifiedBadge",
        "showPartnerBadge",
        "buttonThemeEnable",
      ];

      if (settingsFields.includes(field)) {
        await prisma.plinkkSettings.update({
          where: { plinkkId: selected.id },
          data: { [field]: value },
        });
      } else if (
        field === "name" ||
        field === "bio" ||
        field === "imageUrl" ||
        field === "pseudo"
      ) {
        const updateData: any = { [field]: value };
        if (field === "pseudo") updateData.slug = value;

        await prisma.plinkk.update({
          where: { id: selected.id },
          data: updateData,
        });
      } else if (field === "background") {
        const bgColor = (value as any) as { color: string; stop: number }[];
        if (bgColor.length === 0) {
          await prisma.backgroundColor.deleteMany({
            where: { plinkkId: selected.id },
          });
        } else {
          const background = await prisma.backgroundColor.findMany({
            where: { plinkkId: selected.id },
          });
          if (background.length === 0) {
            await prisma.backgroundColor.createMany({
              data: bgColor.map((bg) => {
                return {
                  userId: selected.userId,
                  color: bg.color,
                  plinkkId: selected.id,
                  stop: bg.stop,
                };
              }),
            });
          } else if (bgColor.length === background.length) {
            const updatePromises = background.map((bg) =>
              prisma.backgroundColor.update({
                data: {
                  color: bg.color,
                  stop: bg.stop,
                },
                where: { id: bg.id },
              }),
            );
            await Promise.all(updatePromises);
          } else {
            await prisma.$transaction([
              prisma.backgroundColor.deleteMany({
                where: { plinkkId: selected.id },
              }),
              prisma.backgroundColor.createMany({
                data: bgColor.map((bg) => ({
                  userId: selected.userId,
                  color: bg.color,
                  plinkkId: selected.id,
                  stop: bg.stop,
                })),
              }),
            ]);
          }
        }
      } else if (field === "backgroundColor") {
        await prisma.$transaction([
              prisma.backgroundColor.deleteMany({
                where: { plinkkId: selected.id },
              }),
              prisma.backgroundColor.create({
                data: {
                  userId: selected.userId,
                  color: value as string,
                  plinkkId: selected.id,
                  stop: 0,
                },
              }),
            ]);
      }

      return { success: true };
    } catch (e) {
      console.error("Update action error:", e);
      return { success: false, error: "Database update failed" };
    }
  },

  saveLink: async ({ request, locals, url }) => {
    const user = locals.user;
    if (!user) return { success: false, error: "Unauthorized" };

    const data = await request.json();
    const plinkkId = url.searchParams.get("plinkkId");
    const pages = await getPlinkksByUserId(user.id);
    const selected = getSelectedPlinkk(pages, plinkkId || undefined);

    if (!selected) return { success: false, error: "Plinkk not found" };

    try {
      if (data.id) {
        // Update
        await prisma.link.update({
          where: { id: data.id, userId: user.id },
          data: {
            type: data.type,
            text: data.text,
            name: data.name,
            url: data.url,
            description: data.description,
            icon: data.icon,
            categoryId: data.categoryId || null,
            buttonTheme: data.buttonTheme,
            iosUrl: data.iosUrl,
            androidUrl: data.androidUrl,
            forceAppOpen: data.forceAppOpen,
            clickLimit: data.clickLimit,
            formData: data.formData || undefined,
            embedData: data.embedData || undefined,
          },
        });
      } else {
        // Create
        const maxIndex = await prisma.link.aggregate({
          where: { plinkkId: selected.id },
          _max: { index: true },
        });
        const nextIndex = (maxIndex._max.index ?? -1) + 1;

        await prisma.link.create({
          data: {
            userId: user.id,
            plinkkId: selected.id,
            type: data.type,
            text: data.text,
            name: data.name,
            url: data.url,
            description: data.description,
            icon: data.icon,
            categoryId: data.categoryId || null,
            buttonTheme: data.buttonTheme,
            iosUrl: data.iosUrl,
            androidUrl: data.androidUrl,
            forceAppOpen: data.forceAppOpen,
            clickLimit: data.clickLimit,
            formData: data.formData || undefined,
            embedData: data.embedData || undefined,
            index: nextIndex,
          },
        });
      }
      return { success: true };
    } catch (e) {
      console.error("SaveLink error:", e);
      return { success: false, error: "Failed to save link" };
    }
  },

  deleteLink: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return { success: false, error: "Unauthorized" };

    const { id } = await request.json();
    try {
      await prisma.link.delete({
        where: { id, userId: user.id },
      });
      return { success: true };
    } catch (e) {
      console.error("DeleteLink error:", e);
      return { success: false, error: "Failed to delete link" };
    }
  },

  saveSocialIcon: async ({ request, locals, url }) => {
    const user = locals.user;
    if (!user) return { success: false, error: "Unauthorized" };

    const data = await request.json();
    const plinkkId = url.searchParams.get("plinkkId");
    const pages = await getPlinkksByUserId(user.id);
    const selected = getSelectedPlinkk(pages, plinkkId || undefined);

    if (!selected) return { success: false, error: "Plinkk not found" };

    try {
      if (data.id) {
        await prisma.socialIcon.update({
          where: { id: data.id, userId: user.id },
          data: {
            icon: data.icon,
            url: data.url,
          },
        });
      } else {
        await prisma.socialIcon.create({
          data: {
            userId: user.id,
            plinkkId: selected.id,
            icon: data.icon,
            url: data.url,
          },
        });
      }
      return { success: true };
    } catch (e) {
      console.error("SaveSocialIcon error:", e);
      return { success: false, error: "Failed to save social icon" };
    }
  },

  deleteSocialIcon: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return { success: false, error: "Unauthorized" };

    const { id } = await request.json();
    try {
      await prisma.socialIcon.delete({
        where: { id, userId: user.id },
      });
      return { success: true };
    } catch (e) {
      console.error("DeleteSocialIcon error:", e);
      return { success: false, error: "Failed to delete social icon" };
    }
  },
};
