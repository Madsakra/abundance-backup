import { FirebaseFirestoreTypes, Timestamp } from "@react-native-firebase/firestore";

export interface nutritionistProfile {
  avatar: string;
  dob: string;
  gender: string;
  profileSpec: ProfileSpec[];
  title: string;
}

export interface ProfileSpec {
  id: string;
  name: string;
  variation: string;
}

export type NutritionistAccount = {
  id: string;
  email: string;
  name: string;
  role: string;
  profile: nutritionistProfile;
};

export type DisplayedReviews = {
  id: string;
  image: string;
  name: string;
  reasons: string[];
  score: number;
};

export interface StatusFeedbackDisplay {
  nutritionistInfo:NutritionistAccount,
  status:string
}

export interface AdviceInformation {
  title:string,
  content:string,
  goalAdvice:string,
  mealPlans:{
    calories:{quantity:number,unit:string},
    fats:{quantity:number,unit:string},
    carbs:{quantity:number,unit:string},
    protein:{quantity:number,unit:string},
    label:string,
  }[],
  timestamp:Timestamp
}


export interface AdviceHistory {
  id: string;
  email: string;
  name: string;
  avatar: string;
  timestamp: FirebaseFirestoreTypes.Timestamp | null;
  title: string;
  content: string;
  goalAdvice: string;
  nutritionistID:string,
}