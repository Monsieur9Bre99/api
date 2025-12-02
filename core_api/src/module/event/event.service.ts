import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EventService {
  constructor(@Inject('NATS_SERVICE') private readonly client: ClientProxy) {}

  // Envoi événement (fire-and-forget)
  emit<T = any>(pattern: string, data: T) {
    return this.client.emit(pattern, data);
  }

  // Envoi événement avec réponse (request-response)
  send<T = any, R = any>(pattern: string, data: T) {
    return firstValueFrom(this.client.send<R, T>(pattern, data));
  }
}
