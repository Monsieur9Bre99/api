import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

const logger = new Logger('NotifService');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [`nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`],
    },
  });

  await app.startAllMicroservices();
  await app.listen(3003);

  logger.log('✅ Notification service: HTTP+WS(3003) + NATS');
}
bootstrap().catch((error) => {
  console.log(error);
});
