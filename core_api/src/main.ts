import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { DetailedErrorInterceptor } from './core/interceptors/error.interceptor';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import * as dotenv from 'dotenv';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.REACT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'set-cookie'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(
    new DetailedErrorInterceptor(),
    new ResponseInterceptor(),
  );
  app.useStaticAssets(path.join(__dirname, '..', 'public', 'uploads'), {
    prefix: '/public/uploads/',
  });

  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: [`nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`],
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.CORE_API_PORT || 3000);
}
bootstrap().catch((error) => {
  console.log(error);
});
