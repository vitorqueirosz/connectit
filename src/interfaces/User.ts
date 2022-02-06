import { User } from '@prisma/client';

export interface IUser extends User {
  confirmPassword?: string;
}
