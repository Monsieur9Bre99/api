import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { iJwtPayload } from '../interface/token.interface';
import * as argon2 from 'argon2';
import { AuthentificationService } from '../../module/authentification/authentification.service';
import { TokenService } from '../../module/token/token.service';

export interface iAuthentificatedRequest extends Request {
  user: iJwtPayload;
}

@Injectable()
export abstract class AuthGuard implements CanActivate {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly authService: AuthentificationService,
  ) {}

  abstract canActivate(context: ExecutionContext): Promise<boolean>;

  protected extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class RefreshTokenGuard extends AuthGuard {
  constructor(
    jwtService: JwtService,
    authService: AuthentificationService,
    private readonly tokenService: TokenService,
  ) {
    super(jwtService, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: iAuthentificatedRequest = context
      .switchToHttp()
      .getRequest<iAuthentificatedRequest>();
    const token = request.cookies['refreshToken'];

    console.log('[Guard] token cookie:', token ? 'present' : 'absent');

    if (!token) {
      throw new UnauthorizedException(
        'nouvelle authentification requise : aucun token fourni',
      );
    }

    if (!this.jwtService) {
      throw new UnauthorizedException('JWT service indisponible');
    }

    const secret = process.env.REFRESH_JWT_SECRET;
    if (!secret) {
      throw new BadRequestException(
        "REFRESH_JWT_SECRET indisponible dans les variables d'environnement",
      );
    }

    let payload: iJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('nouvelle authentification requise');
    }

    const savedToken = await this.tokenService.getToken(
      'REFRESH',
      payload.userId,
    );
    try {
      if (
        !savedToken ||
        savedToken.expires_at < new Date() ||
        !savedToken.token
      ) {
        throw new UnauthorizedException('nouvelle authentification requise');
      }
      const tokensMatches = await argon2.verify(savedToken.token, token);
      if (!tokensMatches) {
        throw new UnauthorizedException('nouvelle authentification requise');
      }
    } catch {
      throw new UnauthorizedException('nouvelle authentification requise');
    }

    request.user = payload;

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends AuthGuard {
  constructor(jwtService: JwtService, authService: AuthentificationService) {
    super(jwtService, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: iAuthentificatedRequest = context
      .switchToHttp()
      .getRequest<iAuthentificatedRequest>();
    const token: string | undefined = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('authentification requise');
    }

    if (!this.jwtService) {
      throw new UnauthorizedException('JWT service indisponible');
    }

    const secret = process.env.ACCESS_JWT_SECRET;
    if (!secret) {
      throw new BadRequestException(
        "ACCESS_JWT_SECRET indisponible dans les variables d'environnement",
      );
    }

    let payload: iJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('token invalide ou expirer');
    }

    request.user = payload;

    return true;
  }
}
