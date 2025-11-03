/**
 * Backend Auth Types
 */

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface JWTPayload {
  sub: string;
  iss: string;
  iat: number;
  exp: number;
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

export interface LoginRequest {
  username: string;
  password: string;
  realm?: string;
  schema?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutAllRequest {
  access_token: string;
}

export interface AuthorizeRequest {
  access_token: string;
  permission?: string;
}
