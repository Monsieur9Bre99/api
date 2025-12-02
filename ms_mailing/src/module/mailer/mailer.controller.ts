import { Controller } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { iSendMailInfo } from '../../core/interface/mail.interface';

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @MessagePattern('send_mail')
  async sendEmail(@Payload() payload: iSendMailInfo) {
    const sendEmailResponse = await this.mailerService.sendEmail(payload);

    return { result: sendEmailResponse };
  }
}
