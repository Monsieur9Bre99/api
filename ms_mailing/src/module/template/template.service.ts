import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailTemplate } from '@prisma/client';
import { iCreateMailTemplate } from 'src/core/interface/mail.interface';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmailTemplate(data: iCreateMailTemplate): Promise<MailTemplate> {
    return this.prisma.mailTemplate.create({ data });
  }

  async getTemplate(template_name: string): Promise<MailTemplate | null> {
    return this.prisma.mailTemplate.findUnique({
      where: { name: template_name },
    });
  }
}
