import { UserRole } from "../modules/user/enum/user-role.enum";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: UserRole;
      };
    }
  }
}
