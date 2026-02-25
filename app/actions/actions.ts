"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Log the application
export async function logApplication(formData: FormData) {
  const count = Number(formData.get("count"));
  const responses = Number(formData.get("responses") || 0);
  const interviews = Number(formData.get("interviews") || 0);

  if (!count || count < 0) return;

  // Normalize date to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.applicationDay.upsert({
    where: { date: today },
    update: { count: { increment: count }, responses: { increment: responses }, interviews: { increment: interviews } },
    create: { date: today, count, responses, interviews },
  });

  revalidatePath("/");
}

// 2. Fetch Heatmap Data
export async function getHeatmapData() {
  const dbData = await prisma.applicationDay.findMany({
    orderBy: { date: "desc" },
    take: 119,
  });

  // Next.js Server Actions require plain objects, not Maps
  const dataRecord: Record<string, number> = {};
  
  dbData.forEach((day) => {
    // Convert native Date to YYYY-MM-DD string
    const dateString = new Date(day.date).toLocaleDateString("en-CA");
    dataRecord[dateString] = day.count;
  });
  
  return dataRecord;
}

// 3. Calculate Real-Time Dashboard Stats
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

  // Create a quick lookup set for dates with > 0 applications to calculate the streak
  const activeDates = new Set(
    allDays.filter(d => d.count > 0).map(d => new Date(d.date).toLocaleDateString("en-CA"))
  );

  allDays.forEach(day => {
    totalApplications += day.count;
    totalResponses += day.responses;

    const dayDate = new Date(day.date);
    if (dayDate.getMonth() === currentMonth && dayDate.getFullYear() === currentYear && day.count > 0) {
      activeDaysThisMonth++;
    }
  });

  // --- STREAK CALCULATION ---
  let currentStreak = 0;
  let checkDate = new Date(today);

  // If they haven't logged today yet, the streak shouldn't break. We start checking from yesterday.
  const todayString = checkDate.toLocaleDateString("en-CA");
  if (activeDates.has(todayString)) {
    currentStreak++;
  }
  
  checkDate.setDate(checkDate.getDate() - 1); // Move to yesterday

  while (true) {
    const dateString = checkDate.toLocaleDateString("en-CA");
    if (activeDates.has(dateString)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break; // Streak broken
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