import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthentificationService } from './authentification.service';
import { UserCreateDto } from '../user/dto/createUser.dto';
import { UserService } from '../user/user.service';
import { SigninDto } from './dto/signin.dto';
import * as argon2 from 'argon2';
import {
  iGenerateTokens,
  iTokenResult,
} from '../../core/interface/token.interface';
import { TokenService } from '../token/token.service';
import {
  iAuthentificatedRequest,
  RefreshTokenGuard,
} from '../../core/guard/authentification.guard';
import {
  AskUpdatePasswordDto,
  UpdatePasswordDto,
} from './dto/update_password.dto';
import { User } from '@prisma/client';
import { EventService } from '../event/event.service';
import { Response } from 'express';
import { iUser } from 'src/core/interface/user.interface';

@Controller('auth')
export class AuthentificationController {
  constructor(
    private readonly authentificationService: AuthentificationService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly eventService: EventService,
  ) {}

  /**
   * Crée un utilisateur avec les informations données en paramètre.
   * Si l'email ou le nom d'utilisateur existe déjà, une erreur est levée.
   * Si la création de l'utilisateur échoue, une erreur est levée.
   * Un email contenant un lien de confirmation est envoyé à l'utilisateur.
   * @param {UserCreateDto} body Les informations de l'utilisateur à créer.
   * @returns {Promise<{ result: string }>} Le résultat de la création de l'utilisateur.
   * @throws {HttpException} Si l'email ou le nom d'utilisateur existe déjà.
   * @throws {HttpException} Si la création de l'utilisateur échoue.
   */
  @Post('/signup')
  async signupUser(@Body() body: UserCreateDto): Promise<{ result: string }> {
    const isUserEmailExist: User | null = await this.userService.getByUniqueKey(
      body.email,
    );
    const isUserUsernameExist: User | null =
      await this.userService.getByUniqueKey(body.username);
    if (isUserEmailExist || isUserUsernameExist) {
      throw new HttpException(
        "L'email ou le nom d'utilisateur existe déjà",
        HttpStatus.CONFLICT,
      );
    }

    const newUser: iUser = await this.userService.createUser(body);
    if (!newUser) {
      throw new HttpException(
        "Échec de la création de l'utilisateur",
        HttpStatus.BAD_REQUEST,
      );
    }

    const emailToken: string = await this.authentificationService.generateToken(
      newUser.id,
      'EMAIL',
    );

    const comfirmAccountUrl = `${process.env.REACT_URL}/login/confirm/${emailToken}`;

    this.eventService.emit('send_mail', {
      to: newUser.email,
      template_name: 'welcome_user',
      variables: {
        username: newUser.username,
        activationLink: comfirmAccountUrl,
      },
    });

    return {
      result: 'compte utilisateur créer avec succès',
    };
  }

  /**
   * Se connecter au compte utilisateur.
   * Si l'email ou le mot de passe est incorrect, une erreur est levée.
   * Si l'utilisateur n'a pas confirmé son adresse email, une erreur est levée.
   * Si la connexion au compte utilisateur échoue, une erreur est levée.
   * Un cookie est envoyé avec le refresh token.
   * l'access token est retourner dans la reponse.
   * @param {SigninDto} body Les informations de connexion au compte utilisateur.
   * @returns {Promise<{ result: { message: string; authentification: { accessToken: string; userId: string; }; };}>} Le résultat de la connexion au compte utilisateur.
   * @throws {HttpException} Si l'email ou le mot de passe est incorrect.
   * @throws {HttpException} Si l'utilisateur n'a pas confirmé son adresse email.
   * @throws {HttpException} Si la connexion au compte utilisateur échoue.
   */
  @Post('/signin')
  @HttpCode(200)
  async signinUser(
    @Body() body: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    result: {
      message: string;
      authentification: {
        accessToken: string;
        userId: string;
      };
    };
  }> {
    const isUserExist: User | null = await this.userService.getByUniqueKey(
      body.email,
      {
        id: true,
        password: true,
        is_confirmed: true,
      },
    );
    const isCorrectPassword: boolean = isUserExist
      ? await argon2.verify(isUserExist.password, body.password)
      : false;

    if (!isUserExist || !isCorrectPassword) {
      throw new HttpException(
        'connexion au compte utilisateur impossible',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!isUserExist.is_confirmed) {
      throw new HttpException(
        'veuillez confirmer votre adresse email avant de vous connecter',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokens: iGenerateTokens =
      await this.authentificationService.generateAuthTokens(
        isUserExist.id,
        body?.rememberMe,
      );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: body.rememberMe ? 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000,
    });

    return {
      result: {
        message: 'connexion au compte utilisateur réussie',
        authentification: {
          accessToken: tokens.accessToken,
          userId: tokens.userId,
        },
      },
    };
  }

  /**
   * Déconnecte l'utilisateur du compte.
   * Si l'utilisateur n'existe pas, une erreur est levée.
   * Si la suppression du refresh token échoue, une erreur est levée.
   * @param {object} body - Les informations de l'utilisateur à déconnecter.
   * @param {string} body.userId - L'ID de l'utilisateur à déconnecter.
   * @returns {Promise<{ result: string }>} Le résultat de la déconnexion de l'utilisateur.
   * @throws {HttpException} Si l'utilisateur n'existe pas.
   * @throws {HttpException} Si la suppression du refresh token échoue.
   */
  @Delete('/signout')
  @HttpCode(200)
  async signoutUser(
    @Body() body: { userId: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ result: string }> {
    const isUserExist: User | null = await this.userService.getByUniqueKey(
      body.userId,
      { id: true },
    );
    if (!isUserExist) {
      throw new HttpException(
        "L'utilisateur n'existe pas",
        HttpStatus.NOT_FOUND,
      );
    }

    await this.tokenService.removeToken(body.userId, 'REFRESH');

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return { result: 'déconnexion réussie' };
  }

  /**
   * Confirme le compte utilisateur en fonction du token d'email fourni.
   * Si le token n'existe pas, est expiré ou n'a pas d'utilisateur correspondant, une erreur est levée.
   * Si la confirmation du compte échoue, une erreur est levée.
   * @param {string} emailToken - Le token d'email.
   * @returns {Promise<{ result: string }>} Le résultat de la confirmation du compte utilisateur.
   * @throws {HttpException} Si le token n'existe pas, est expiré ou n'a pas d'utilisateur correspondant.
   * @throws {HttpException} Si la confirmation du compte échoue.
   */
  @Post('/confirm/:emailToken')
  @HttpCode(200)
  async confirmUser(
    @Param('emailToken') emailToken: string,
  ): Promise<{ result: string }> {
    const user: iTokenResult | null = await this.tokenService.getToken(
      'EMAIL',
      undefined,
      emailToken,
    );
    if (!user || user.expires_at < new Date() || !user.user_id) {
      throw new HttpException(
        'confirmation du compte impossible',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.userService.updateUser(user.user_id, {
      is_confirmed: true,
    });
    await this.tokenService.removeToken(user.user_id, 'EMAIL');

    this.eventService.emit('user-preferences.create', {
      user_id: updatedUser.id,
      email: updatedUser.email,
    });

    return { result: 'compte utilisateur confirmé avec succès' };
  }

  /**
   * Demande un lien pour mettre à jour le mot de passe d'un utilisateur.
   *
   * @param {AskUpdatePasswordDto} body Les informations de l'utilisateur à mettre à jour.
   * @returns {Promise<{ result: string }>} Le lien pour mettre à jour le mot de passe de l'utilisateur.
   * @throws {HttpException} Si l'utilisateur n'existe pas.
   */
  @Post('/update_password')
  async askUpdatePassword(
    @Body()
    body: AskUpdatePasswordDto,
  ): Promise<{ result: string }> {
    const isUserExist: User | null = await this.userService.getByUniqueKey(
      body.email,
      {
        id: true,
      },
    );
    if (!isUserExist) {
      throw new HttpException(
        "L'utilisateur n'existe pas",
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordToken: string =
      await this.authentificationService.generateToken(
        isUserExist.id,
        'PASSWORD',
      );

    const update_paswword_url: string = `${passwordToken}_${isUserExist.id}`;

    return {
      result: update_paswword_url,
    };
  }

  /**
   * Met à jour le mot de passe d'un utilisateur.
   *
   * @param {string} updatePasswordUrl - Le lien pour mettre à jour le mot de passe de l'utilisateur.
   * @param {UpdatePasswordDto} body - Les informations de l'utilisateur à mettre à jour.
   * @returns {Promise<{ result: string }>} Le statut de la mise à jour du mot de passe de l'utilisateur.
   * @throws {HttpException} Si le changement de mot de passe est impossible.
   */
  @Patch('/update_password/:update_password_url')
  async updatePassword(
    @Param('update_password_url') updatePasswordUrl: string,
    @Body() body: UpdatePasswordDto,
  ): Promise<{ result: string }> {
    const urlPart: string[] = updatePasswordUrl.split('_');

    const user: iTokenResult | null = await this.tokenService.getToken(
      'PASSWORD',
      undefined,
      urlPart[0],
    );

    if (!user || user.expires_at < new Date() || !user.user_id) {
      throw new HttpException(
        'changement de mot de passe impossible',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.user_id !== urlPart[1]) {
      throw new HttpException(
        'changement de mot de passe impossible',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashNewPassword: string = await argon2.hash(body.new_password, {
      hashLength: 50,
    });

    await this.userService.updateUser(urlPart[1], {
      password: hashNewPassword,
    });
    await this.tokenService.removeToken(urlPart[1], 'PASSWORD');

    return { result: 'modification du mot de passe reussie' };
  }

  /**
   * Rafraîchit les tokens d'accès et de rafraîchissement d'un utilisateur.
   * Le token d'accès est mis à jour avec une nouvelle valeur aléatoire.
   * Le token de rafraîchissement est mis à jour avec une nouvelle valeur aléatoire et une date d'expiration dans 12 heures.
   *
   * @param {iAuthentificatedRequest} request - Les informations de l'utilisateur authentifié.
   * @param {Response} res - La réponse Express.
   * @returns {Promise<{ result: { message: string; authentification: { accessToken: string; userId: string; }; }; }> La réponse avec les nouveaux tokens.
   */
  @Patch('/refresh')
  @HttpCode(200)
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(
    @Req() request: iAuthentificatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    result: {
      message: string;
      authentification: {
        accessToken: string;
        userId: string;
      };
    };
  }> {
    const userId: string = request.user.userId;

    const tokens: iGenerateTokens =
      await this.authentificationService.generateAuthTokens(userId);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 12 * 60 * 60 * 1000,
    });

    return {
      result: {
        message: 'tokens rafraîchis avec succès',
        authentification: {
          accessToken: tokens.accessToken,
          userId: tokens.userId,
        },
      },
    };
  }
}
