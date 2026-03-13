import {
  GetProfileController,
  GetUserByIdController,
} from "@modules/user/useCases";
import { ensureAuthenticated } from "@shared/middlewares";
import { Router } from "express";
import { container } from "tsyringe";

const userRouter = Router();
const getProfileController = container.resolve(GetProfileController);
const getUserByIdController = container.resolve(GetUserByIdController);

userRouter.get(
  "/profile",
  ensureAuthenticated,
  getProfileController.handle.bind(getProfileController),
);
userRouter.get(
  "/:id",
  ensureAuthenticated,
  getUserByIdController.handle.bind(getUserByIdController),
);

export { userRouter };
