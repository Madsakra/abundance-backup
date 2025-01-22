export type UserRole = 'user' | 'nutritionist' | 'admin';

export interface UserAccount {
  email: string;
  name: string;
  role: UserRole;
}
