import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasourceUrl: 'file:./prisma/data/app.db'
});