import { UserRole } from "../enum/user-role.enum";

export class User {
  id?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username!: string;
  email!: string;
  phoneNumber?: string;
  password!: string;
  eloRating: number = 1200;
  penaltyPoints: number = 0;
  role: UserRole = UserRole.USER;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<User>, id?: string) {
    Object.assign(this, props);
    this.id = id;
    if (props.eloRating === undefined) this.eloRating = 1200;
    if (props.penaltyPoints === undefined) this.penaltyPoints = 0;
    if (props.role === undefined) this.role = UserRole.USER;
  }

  toPublic(): Omit<User, "password" | "toPublic"> {
    const { password, toPublic, ...publicUser } = this;
    return publicUser;
  }
}
