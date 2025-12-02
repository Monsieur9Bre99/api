import { Body, Controller, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateMailTemplateDto } from './dto/event.create';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('/create_mail_template')
  async createMailTemplate(@Body() body: CreateMailTemplateDto) {
    const response = await this.eventService.send('emailTemplate.create', body);
    return { result: response };
  }
}
