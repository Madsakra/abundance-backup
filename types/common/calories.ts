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

export interface MET_task {
  id:string,
  name:string,
  value:number
}

export interface CaloriesOutputTracking {
  amount:number;
  category:"activity";
  MET_task:MET_task;
  timestamp:Date;
  type:LogType;

}
