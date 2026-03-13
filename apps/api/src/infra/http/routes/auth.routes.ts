import { Router } from "express";
import { container } from "tsyringe";
import { RegisterUserController } from "@modules/auth/useCases/RegisterUser/RegisterUserController";
import { LoginUserController } from "@modules/auth/useCases/LoginUser/LoginUserController";
import { CreateUserByAdminController } from "@modules/auth/useCases/CreateUserByAdmin/CreateUserByAdminController";
import { ensureAuthenticated, ensureAdmin } from "@shared/middlewares";

const authRouter = Router();
const registerUserController = container.resolve(RegisterUserController);
const loginUserController = container.resolve(LoginUserController);
const createUserByAdminController = container.resolve(
  CreateUserByAdminController,
);

authRouter.post(
  "/register",
  registerUserController.handle.bind(registerUserController),
);
authRouter.post("/login", loginUserController.handle.bind(loginUserController));

authRouter.post(
  "/admin-create-user",
  ensureAuthenticated,
  ensureAdmin,
  createUserByAdminController.handle.bind(createUserByAdminController),
);

export { authRouter };
