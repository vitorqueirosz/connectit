import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

interface IAuthenticationService {
  comparePasswords: (
    password: string,
    hashedPassword: string,
  ) => Promise<boolean>;
  setPasswordHash: (password: string) => Promise<string>;
  generateToken: (user_id: number) => string;
}

export class AuthenticationService implements IAuthenticationService {
  async comparePasswords(password: string, hashedPassword: string) {
    const isPasswordsEqual = compare(password, hashedPassword);

    return isPasswordsEqual;
  }

  setPasswordHash(password: string, salt = 8) {
    const hashedPassword = hash(password, salt);

    return hashedPassword;
  }

  generateToken(user_id: number) {
    const token = sign({}, '56983a4f996bdd76b1fa39e419f0ca80', {
      subject: String(user_id),
      expiresIn: '7d',
    });

    return token;
  }

  decodeToken(token: string) {
    return verify(token, '56983a4f996bdd76b1fa39e419f0ca80');
  }
}
