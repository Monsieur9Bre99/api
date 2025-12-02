export interface iGenerateTokens {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export interface iJwtPayload {
  userId: string;
}

export interface iTokensOptions {
  secret: string;
  expiresIn: string;
}

export interface iTokenResult {
  token?: string;
  user_id?: string;
  expires_at: Date;
}
