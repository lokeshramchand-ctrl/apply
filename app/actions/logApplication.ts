"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logApplication(formData: FormData) {
  const apps = Number(formData.get("apps"));
  const replies = Number(formData.get("replies") ?? 0);
  const interviews = Number(formData.get("interviews") ?? 0);

  if (!apps || apps < 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dayLog.upsert({
    where: { date: today },
    update: { apps, replies, interviews },
    create: { date: today, apps, replies, interviews },
  });

  revalidatePath("/");
}