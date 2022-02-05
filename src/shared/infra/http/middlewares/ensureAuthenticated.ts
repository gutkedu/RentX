import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UsersRepository } from "@modules/account/infra/typeorm/repositories/UsersRepository";
import { AppError } from "@shared/errors/AppError";

interface IPayload {
  sub: string;
}

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token is missing!", 401);
  }
  // [0] - Bearer, [1] = token
  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id } = verify(token, "be099fcd19a5a65037e9a1f594379027") as IPayload;

    const usersRepository = new UsersRepository;
    const user = await usersRepository.findById(user_id);

    if (!user) {
      throw new AppError("User does not exist!", 401);
    }

    request.user = {
      id: user_id,
    }

    next();

  } catch (error) {
    throw new AppError("Invalid Token!", 401)
  }
}