import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { TemplateService } from '../template/template.service';
import { iSendMailInfo } from 'src/core/interface/mail.interface';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly mailer: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly templateService: TemplateService,
  ) {
    this.mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  async sendEmail(
    data: iSendMailInfo,
  ): Promise<{ status: string; response: string }> {
    const template = await this.templateService.getTemplate(data.template_name);

    if (!template) throw new Error(`template ${data.template_name} not found`);

    let html = template.bodyHtml;
    let text = template.bodyText || '';

    for (const [key, value] of Object.entries(data.variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, value);
      text = text.replace(regex, value);
    }

    let status: 'SENT' | 'FAILED' = 'SENT';
    let response;

    try {
      response = await this.mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: data.to,
        subject: template.subject,
        html,
        text,
      });
      response = {
        message: `Email envoyé à ${data.to} via template ${data.template_name}`,
      };
    } catch (error) {
      status = 'FAILED';
      response = { message: error.message };
      this.logger.error(
        `Erreur lors de l'envoi du mail à ${data.to}`,
        error.stack,
      );
    }

    await this.prisma.mailLog.create({
      data: {
        to: data.to,
        status,
        response,
        templateId: template.id,
      },
    });

    if (status === 'FAILED') throw new Error('Mail not sent');

    return { status, response };
  }
}
