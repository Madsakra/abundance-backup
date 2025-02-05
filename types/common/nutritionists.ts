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
