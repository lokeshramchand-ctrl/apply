"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function logApplication(formData: FormData) {
  const count = Number(formData.get("count"));
  const responses = Number(formData.get("responses") || 0);
  const interviews = Number(formData.get("interviews") || 0);

  if (!count || count < 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.applicationDay.upsert({
    where: { date: today.toLocaleDateString("en-CA") },
    update: { count: { increment: count }, responses: { increment: responses }, interviews: { increment: interviews } },
    create: { date: today.toLocaleDateString("en-CA"), count, responses, interviews },
  });

  revalidatePath("/");
}

export async function getHeatmapData() {
  const dbData = await prisma.applicationDay.findMany({
    orderBy: { date: "desc" },
    take: 119,
  });

  const dataRecord: Record<string, number> = {};
  
  dbData.forEach((day: { date: string | number | Date; count: number }) => {
    const dateString = new Date(day.date).toLocaleDateString("en-CA");
    dataRecord[dateString] = day.count;
  });
  
  return dataRecord;
}

export async function getDashboardStats() {
  const allDays = await prisma.applicationDay.findMany({
    orderBy: { date: "desc" }
  });

  let totalApplications = 0;
  let totalResponses = 0;
  let activeDaysThisMonth = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const activeDates = new Set(
    allDays.filter((d: { count: number; date: string | number | Date }) => d.count > 0).map((d: { date: string | number | Date }) => new Date(d.date).toLocaleDateString("en-CA"))
  );

  allDays.forEach((day: { count: number; responses: number; date: string | number | Date }) => {
    totalApplications += day.count;
    totalResponses += day.responses;

    const dayDate = new Date(day.date);
    if (dayDate.getMonth() === currentMonth && dayDate.getFullYear() === currentYear && day.count > 0) {
      activeDaysThisMonth++;
    }
  });

  let currentStreak = 0;
  let checkDate = new Date(today);

  const todayString = checkDate.toLocaleDateString("en-CA");
  if (activeDates.has(todayString)) {
    currentStreak++;
  }
  
  checkDate.setDate(checkDate.getDate() - 1);

  while (true) {
    const dateString = checkDate.toLocaleDateString("en-CA");
    if (activeDates.has(dateString)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const responseRate = totalApplications > 0 
    ? Math.round((totalResponses / totalApplications) * 100) 
    : 0;

  return {
    streak: currentStreak,
    totalApplications,
    activeDaysThisMonth,
    responseRate: `${responseRate}%`
  };
}