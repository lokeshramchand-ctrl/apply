// app/actions.ts
"use server";

import { prisma } from '../lib/prisma';
import { revalidatePath } from 'next/cache';

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

export async function getHeatmapData() {
  // Fetch up to 119 most recent records
  const dbData = await prisma.applicationDay.findMany({
    orderBy: { date: 'desc' },
    take: 119,
  });

  // Map the raw DB data to a simple lookup object
  const dataMap = new Map(dbData.map(day => [day.date, day.applications]));
  
  return dataMap;
}