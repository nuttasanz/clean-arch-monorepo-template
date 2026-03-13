import "reflect-metadata";
import { container } from "tsyringe";
import { IUserRepository } from "@modules/user/repositories/IUserRepository";
import { SqlUserRepository } from "@modules/user/repositories/SqlUserRepository";

container.registerSingleton<IUserRepository>(
  "UserRepository",
  SqlUserRepository,
);
