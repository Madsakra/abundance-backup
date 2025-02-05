export type UserRole = 'user' | 'nutritionist' | 'admin';

export interface UserAccount {
  email: string;
  name: string;
  role: UserRole;
}

export interface UserMembership {
  membershipID: string;
  currency: string;
  tier_name: string;
  value: number;
}
