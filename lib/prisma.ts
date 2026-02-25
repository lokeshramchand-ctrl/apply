"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Initialize Prisma client (in development, you'd want a global singleton to prevent hot-reload connection limits, but for this SQLite setup, this is fine)
const prisma = new PrismaClient();

export async function logApplication(formData: FormData) {
  // Extract and parse form data
  const applications = parseInt(formData.get('applications') as string) || 0;
  const responses = parseInt(formData.get('responses') as string) || 0;
  const interviews = parseInt(formData.get('interviews') as string) || 0;

  // Get today's date in YYYY-MM-DD format based on local time
  const today = new Date().toLocaleDateString('en-CA'); 

  // The Upsert Magic: If 'today' exists, add to the existing numbers. If not, create a new row.
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

  // Tell Next.js to clear the cache for the home page and fetch fresh DB data
  revalidatePath('/');
}

// Helper function to fetch data for the heatmap
export async function getHeatmapData() {
  const data = await prisma.applicationDay.findMany({
    orderBy: { date: 'desc' },
    take: 119, // Fetching the exact amount needed for your 17-week grid
  });
  
  return data;
}