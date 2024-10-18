import { UserRole } from '../enum/role.enum';

export class UserDto {
  userId: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}
