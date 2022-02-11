import { INTERNAL_ERROR, UNAUTHORIZED } from 'constants/codes';
import { NextFunction, Request, Response } from 'express';
import { AuthenticationService } from 'services/AuthenticationService';

export const ensureAuthenticated = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response
      .status(500)
      .json({ code: INTERNAL_ERROR, error: 'JWT token is missing' });
  }

  const authenticationService = new AuthenticationService();

  const [, token] = authHeader.split(' ');

  try {
    const decoded = authenticationService.decodeToken(token);

    const { sub } = decoded;

    request.user = { id: Number(sub) };

    return next();
  } catch (error) {
    return response
      .status(401)
      .json({ code: UNAUTHORIZED, error: 'JWT token is invalid' });
  }
};
