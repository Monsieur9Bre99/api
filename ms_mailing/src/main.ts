import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
const logger = new Logger('MailService');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [`nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`],
      },
    },
  );
  await app.listen();
  logger.log('✅ Mail microservice connected to NATS and running');
}
bootstrap().catch((error) => {
  console.log(error);
});
