import { Module, Global } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

console.log('ENV NATS_DNS =', process.env.NATS_DNS);
console.log('ENV NATS_PORT =', process.env.NATS_PORT);
console.log(
  'NATS URL =',
  `nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`,
);

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [
            `nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`,
          ],
        },
      },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
