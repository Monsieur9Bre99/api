import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

if (
  !env('MAIL_DB_USER') ||
  !env('MAIL_DB_PASSWORD') ||
  !env('MAIL_DB_HOST') ||
  !env('MAIL_DB_NAME')
) {
  throw new Error('Variables de DB non définies dans .env');
} else {
  console.log('Variables de DB chargées depuis .env');
}

process.env.DATABASE_URL = `postgresql://${env('MAIL_DB_USER')}:${env('MAIL_DB_PASSWORD')}@${env('MAIL_DB_HOST')}:${env('MAIL_DB_PORT') || '5432'}/${env('MAIL_DB_NAME')}`;

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
