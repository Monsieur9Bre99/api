import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Supprime les tokens qui ont expiré.
   * Cette fonction est appelée toutes les heures par le système de tâche cron.
   * Elle utilise la méthode deleteMany de Prisma pour supprimer les tokens
   * qui ont une date d'expiration inférieure à l'heure actuelle.
   * La quantité de tokens supprimés est loguée dans la console.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredTokens() {
    const deleted = await this.prisma.token.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Tokens expirés supprimés: ${deleted.count}`);
  }
}
