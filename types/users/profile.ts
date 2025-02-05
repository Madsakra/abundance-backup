import { Goal } from '../common/goal';
import { SelectedHealthProfile } from '../common/health-condition';

export interface UserProfile {
  birthDate: string;
  gender: string;
  goals: Goal[];
  height: number;
  image: string;
  profileDiet: SelectedHealthProfile[];
  profileHealthCondi: SelectedHealthProfile[];
  weight: number;
}
