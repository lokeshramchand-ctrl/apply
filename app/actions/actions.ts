// app/actions.ts
"use server";

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

export async function getHeatmapData() {
  // Fetch the last 119 days of activity
  const dbData = await prisma.applicationDay.findMany({
    orderBy: { date: "desc" },
    take: 119,
  });

  // Convert the DB records into a simple Map: { "YYYY-MM-DD" -> count }
  const dataMap = new Map<string, number>();
  
  dbData.forEach((day) => {
    // Convert your Date object back to the local string format the frontend expects
    const dateString = new Date(day.date).toLocaleDateString("en-CA");
    dataMap.set(dateString, day.count);
  });
  
  return dataMap;
}
export async function logApplication(formData: FormData) {
  const applications = parseInt(formData.get('applications') as string) || 0;
  const responses = parseInt(formData.get('responses') as string) || 0;
  const interviews = parseInt(formData.get('interviews') as string) || 0;

  // Local date in YYYY-MM-DD
  const today = new Date().toLocaleDateString('en-CA'); 

  await prisma.applicationDay.upsert({
    where: { date: today },
    update: {
      applications: { increment: applications },
      responses: { increment: responses },
      interviews: { increment: interviews },
    },
    create: {
      date: today,
      applications,
      responses,
      interviews,
    },
  });

  revalidatePath('/');
}

export { prisma };
