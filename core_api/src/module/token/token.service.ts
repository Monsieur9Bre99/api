import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as argon2 from 'argon2';
import {
  calcDateFromNow,
  convertToTimestamp,
} from '../../core/utils/converter.func';
import { TokenType } from '@prisma/client';
import { UpsertTokenDto } from './dto/token.dto';
import { iTokenResult } from '../../core/interface/token.interface';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée ou met à jour un token en fonction des données données en paramètre.
   * Le token est hashé avec l'algorithme Argon2.
   * Si le token existe déjà, il est mis à jour.
   * Sinon, il est créé.
   *
   * @param {UpsertTokenDto} data Les données du token à créer ou mettre à jour.
   * @returns {Promise<Token>} Le token créé ou mis à jour.
   */
  async upsertToken(data: UpsertTokenDto) {
    const expiresAt = calcDateFromNow(convertToTimestamp(data.expires_at));

    const hashedToken = await argon2.hash(data.token, { hashLength: 200 });

    return this.prisma.token.upsert({
      where: { token_type_id: { user_id: data.user_id, type: data.type } },
      update: {
        token: hashedToken,
        expires_at: expiresAt,
      },
      create: {
        user_id: data.user_id,
        token: hashedToken,
        type: data.type,
        expires_at: expiresAt,
      },
    });
  }

  /**
   * Supprime un token en fonction de l'ID de l'utilisateur et du type de token.
   *
   * @param {string} userId - L'ID de l'utilisateur.
   * @param {TokenType} type - Le type de token.
   * @returns {Promise<Token>} Le token supprimé.
   */
  async removeToken(userId: string, type: TokenType) {
    return this.prisma.token.delete({
      where: { token_type_id: { user_id: userId, type: type } },
    });
  }

  /**
   * Retourne un token en fonction de l'ID de l'utilisateur et du type de token ou du token lui-même.
   *
   * Si l'ID de l'utilisateur est fourni, le token est recherché en fonction de l'ID de l'utilisateur et du type de token.
   * Si le token est fourni, le token est recherché en fonction du type de token et du token lui-même.
   * Si aucun des deux paramètres n'est fourni, la fonction retourne null.
   *
   * @param {TokenType} type - Le type de token.
   * @param {string} [user_id] - L'ID de l'utilisateur.
   * @param {string} [token] - Le token lui-même.
   * @returns {Promise<iTokenResult | null>} Le token trouvé ou null si aucun token n'a été trouvé.
   */
  async getToken(
    type: TokenType,
    user_id?: string,
    token?: string,
  ): Promise<iTokenResult | null> {
    if (user_id) {
      return this.prisma.token.findUnique({
        where: { token_type_id: { user_id: user_id, type: type } },
        select: { token: true, expires_at: true },
      });
    } else if (token) {
      const tokens = await this.prisma.token.findMany({
        where: { type },
        select: { user_id: true, token: true, expires_at: true },
      });

      for (const t of tokens) {
        const isMatch = await argon2.verify(t.token, token);
        if (isMatch) {
          return { user_id: t.user_id, expires_at: t.expires_at };
        }
      }
      return null;
    }
    return null;
  }
}
