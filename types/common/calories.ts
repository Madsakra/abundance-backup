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
  timestamp: Date;
  type: LogType;
  userID: string | undefined;
}
