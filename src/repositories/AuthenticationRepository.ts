import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';

interface IAuthenticationRepository {
  comparePasswords: (
    password: string,
    hashedPassword: string,
  ) => Promise<boolean>;
  setPasswordHash: (password: string) => Promise<string>;
  generateToken: (user_id: string) => string;
}

export class AuthenticationRepository implements IAuthenticationRepository {
  async comparePasswords(password: string, hashedPassword: string) {
    const isPasswordsEqual = compare(password, hashedPassword);

    return isPasswordsEqual;
  }

  setPasswordHash(password: string, salt = 8) {
    const hashedPassword = hash(password, salt);

    return hashedPassword;
  }

  generateToken(user_id: string) {
    const token = sign({}, '56983a4f996bdd76b1fa39e419f0ca80', {
      subject: user_id,
      expiresIn: '7d',
    });

    return token;
  }
}
