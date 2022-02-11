import { prismaClient } from 'services/prisma';
import { Request, Response } from 'express';
import { AuthenticationRepository } from 'repositories/AuthenticationRepository';

class AuthenticationController {
  async auth(request: Request, response: Response) {
    const { email, password } = request.body;

    const authenticationRepository = new AuthenticationRepository(prismaClient);

    const user = await authenticationRepository.authenticate({
      email,
      password,
    });

    return response.json({ user });
  }
}

export default new AuthenticationController();
