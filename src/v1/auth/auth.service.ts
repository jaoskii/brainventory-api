import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(body: unknown) {
    // TODO: validate input, hash password, save user
    return { message: 'register placeholder' };
  }

  login(body: unknown) {
    // TODO: validate credentials, return JWT
    return { message: 'login placeholder' };
  }

  logout(req: unknown) {
    // TODO: invalidate token / session
    return { message: 'logout placeholder' };
  }

  refresh(body: unknown) {
    // TODO: validate refresh token, issue new access token
    return { message: 'refresh placeholder' };
  }

  me(req: unknown) {
    // TODO: extract user from JWT, return profile
    return { message: 'me placeholder' };
  }
}
