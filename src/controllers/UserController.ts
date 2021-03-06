import { Request, Response } from 'express';
import { UserRepository } from 'repositories/UserRepository';
import { prismaClient } from 'services';

class UserController {
  async create(request: Request, response: Response) {
    const userData = request.body;

    const userRepository = new UserRepository(prismaClient);

    const user = await userRepository.create({
      ...userData,
    });

    return response.status(201).json({ user });
  }

  async get(request: Request, response: Response) {
    const user_id = request.user.id;

    const userRepository = new UserRepository(prismaClient);

    const user = await userRepository.get(user_id);

    return response.status(201).json({ user });
  }
}

export default new UserController();
