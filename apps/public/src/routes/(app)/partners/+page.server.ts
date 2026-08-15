import { prisma } from "@plinkk/prisma";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const partners = await prisma.partner.findMany({
      where: { isActive: true },
      include: {
        quests: {
          where: { isActive: true },
        },
      },
      orderBy: { order: "asc" },
    });

    try {
      const partnerIds = partners.map((p) => p.id);

      const statsAgg =
        partnerIds.length > 0
          ? await prisma.partnerStatDaily.groupBy({
              by: ["partnerId"],
              where: { partnerId: { in: partnerIds } },
              _sum: { views: true, clicks: true },
            })
          : [];

      const quests =
        partnerIds.length > 0
          ? await prisma.partnerQuest.findMany({
              where: { partnerId: { in: partnerIds } },
              select: { id: true, partnerId: true },
            })
          : [];

      const questIds = quests.map((q) => q.id);
      const userQuestSums =
        questIds.length > 0
          ? await prisma.userQuest.groupBy({
              by: ["partnerQuestId"],
              where: { partnerQuestId: { in: questIds } },
              _sum: { gemsRewarded: true },
            })
          : [];

      const statsMap = new Map<string, { views: number; clicks: number }>();
      statsAgg.forEach((s) => {
        statsMap.set(s.partnerId, {
          views: s._sum.views || 0,
          clicks: s._sum.clicks || 0,
        });
      });

      const questToPartner = new Map<string, string>();
      quests.forEach((q) => questToPartner.set(q.id, q.partnerId));

      const gemsMap = new Map<string, number>();
      userQuestSums.forEach((uq) => {
        const pid = questToPartner.get(uq.partnerQuestId);
        if (!pid) return;
        const current = gemsMap.get(pid) || 0;
        gemsMap.set(pid, current + (uq._sum.gemsRewarded || 0));
      });

      partners.forEach((p) => {
        const s = statsMap.get(p.id) || { views: 0, clicks: 0 };
        p.stats = {
          views: s.views,
          clicks: s.clicks,
          gemsAwarded: gemsMap.get(p.id) || 0,
        };
      });
    } catch (e) {
      return {
        partners: [],
        userQuests: [],
        plinkkGems: 0,
        error: "Failed to fetch partners",
      };
    }

    //const sessionData = request.session.get("data");
    //const userId = (
    //  typeof sessionData === "object" ? sessionData?.id : sessionData
    //) as string | undefined;

    /* let userQuests: string[] = [];
    let plinkkGems = 0;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          plinkkGems: true,
        },
      });
      if (user) plinkkGems = user.plinkkGems;

      const completed = await prisma.userQuest.findMany({
        where: { userId },
        select: { partnerQuestId: true },
      });
      userQuests = completed.map((uq) => uq.partnerQuestId);
    } */
    return {
      partners: partners || [],
      userQuests: [],
      plinkkGems: 0,
    };
  } catch (e) {
    return {
      partners: [],
      userQuests: [],
      plinkkGems: 0,
      error: "An error occurred while fetching partners",
    };
  }
};
