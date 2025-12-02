import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

if (
  !env('MYSQL_USER') ||
  !env('MYSQL_PASSWORD') ||
  !env('MYSQL_HOST') ||
  !env('MYSQL_DATABASE')
) {
  throw new Error('Variables de DB non définies dans .env');
} else {
  console.log('Variables de DB chargées depuis .env');
}

process.env.DATABASE_URL = `mysql://${env('MYSQL_USER')}:${env('MYSQL_PASSWORD')}@${env('MYSQL_HOST')}:${env('MYSQL_PORT') || '5432'}/${env('MYSQL_DATABASE')}`;

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
