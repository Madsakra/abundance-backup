import { Diet } from '../common/diet';
import { Goal } from '../common/goal';
import { HealthCondition } from '../common/health-condition';

export interface UserProfile {
  birthDate: string;
  gender: string;
  goals: Goal[];
  height: number;
  image: string;
  profileDiet: Diet[];
  profileHealthCondi: HealthCondition[];
  weight: number;
}
