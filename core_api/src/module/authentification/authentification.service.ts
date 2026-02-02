import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  iGenerateTokens,
  iJwtPayload,
} from '../../core/interface/token.interface';
import { TokenService } from '../token/token.service';
import { TokenType } from '@prisma/client';
import * as crypto from 'crypto';
import { Response } from 'express';

@Injectable()
export class AuthentificationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Génère un token aléatoire pour l'utilisateur donné et le type de token donné.
   * Le token est stocké dans la base de données avec l'ID de l'utilisateur et le type de token.
   * Le token expire après 3 heures.
   *
   * @param {string} userId - L'ID de l'utilisateur.
   * @param {TokenType} type - Le type de token.
   * @returns {Promise<string>} Le token généré.
   */
  async generateToken(userId: string, type: TokenType): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = '3h';

    await this.tokenService.upsertToken({
      user_id: userId,
      token: token,
      type: type,
      expires_at: expiresAt,
    });

    return token;
  }

  /**
   * Génère un couple d'access token et de refresh token pour l'utilisateur donné.
   * Si le paramètre remember est à true, le refresh token expire après 24 heures, sinon il expire après 12 heures.
   * Les tokens sont stockés dans la base de données avec l'ID de l'utilisateur et le type de token.
   * Le token d'accès expire après 5 minutes.
   *
   * @param {string} userId - L'ID de l'utilisateur.
   * @param {boolean} [remember] - Si true, le refresh token expire après 24 heures, sinon il expire après 12 heures.
   * @returns {Promise<iGenerateTokens>} Le couple d'access token et de refresh token généré.
   */
  async generateAuthTokens(
    userId: string,
    remember?: boolean,
  ): Promise<iGenerateTokens> {
    const payload: iJwtPayload = { userId };

    if (!process.env.REFRESH_JWT_SECRET || !process.env.ACCESS_JWT_SECRET) {
      throw new Error(
        'REFRESH_TOKEN_SECRET ou ACCESS_TOKEN_SECRET non défini !',
      );
    }

    const expiredTime = remember ? '24h' : '12h';
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: expiredTime,
    });
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_JWT_SECRET,
      expiresIn: '5m',
    });

    await this.tokenService.upsertToken({
      user_id: userId,
      token: refreshToken,
      type: 'REFRESH',
      expires_at: expiredTime,
    });

    return {
      userId: userId,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
