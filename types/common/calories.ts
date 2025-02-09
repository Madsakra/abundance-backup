export type LogType = 'input' | 'output';
export type Category = 'meal' | 'exercise';

export interface FoodInfo {
  carbs: number;
  fats: number;
  protein: number;
  name: string;
  image_url: string;
}

export interface CaloriesTracking {
  amount: number;
  category: Category;
  food_info: FoodInfo;
  timestamp: any;
  type: LogType;
  userID: string | undefined;
}

export interface MET_task {
  id: string;
  name: string;
  value: number;
}

export interface StepTrack {
  steps: number;
  distance: number;
  name: string;
}

export interface CaloriesOutputTracking {
  amount: number;
  category: 'activity';
  MET_task?: MET_task;
  StepTrack?: StepTrack;
  timestamp: any;
  type: LogType;
}
