"use server";

import { prisma } from "@/app/actions/actions";
import { revalidatePath } from "next/cache";

export async function logApplication(formData: FormData) {
  const count = Number(formData.get("count"));
  const responses = Number(formData.get("responses") || 0);
  const interviews = Number(formData.get("interviews") || 0);

  if (!count || count < 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.applicationDay.upsert({
    where: { date: today },
    update: {
      count,
      responses,
      interviews,
    },
    create: {
      date: today,
      count,
      responses,
      interviews,
    },
  });

  revalidatePath("/");
}