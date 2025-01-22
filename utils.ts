import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { createRef } from 'react';

import { IToast } from './components/notifications/toast';
import { DigestItem, EdamamItem } from './types/common/edaman';

export const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_ID;
export const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_GPT_KEY;

export const db = firestore();
export const currentUser = auth().currentUser;

export const toggleItemInList = <T>(
  item: T,
  setState: React.Dispatch<React.SetStateAction<T[]>>
) => {
  setState((prevList) => {
    const itemExists = prevList.includes(item); // Will work for any type
    return itemExists ? prevList.filter((listItem) => listItem !== item) : [...prevList, item];
  });
};

// for profile creation only
export const updateLocalProfileFields = async (fields: Record<string, any>) => {
  try {
    // Retrieve the existing profile data
    const existingData = await AsyncStorage.getItem('profileData');
    const profile = existingData ? JSON.parse(existingData) : {};

    // Merge the new fields into the profile data
    Object.keys(fields).forEach((key) => {
      profile[key] = fields[key];
    });

    // Save the updated profile data back to AsyncStorage
    await AsyncStorage.setItem('profileData', JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to update profile data:', error);
  }
};

export const getNutrient = (tag: string, item: EdamamItem): string => {
  const nutrient: DigestItem | undefined = item.digest.find((nutrient) => nutrient.tag === tag);

  return nutrient ? nutrient.total.toFixed(2) : 'N/A';
};

export const getNutrientPerServing = (tag: string, item: EdamamItem): number => {
  const nutrient: DigestItem | undefined = item.digest.find((nutrient) => nutrient.tag === tag);

  if (nutrient && item.yield > 0) {
    return Math.round((nutrient.total / item.yield) * 100) / 100;
  }

  return 0;
};

export const getCaloriesPerServing = (item: EdamamItem): number => {
  if (item.calories && item.yield > 0) {
    return Math.round((item.calories / item.yield) * 100) / 100;
  }
  return 0;
};

export const toastRef = createRef<IToast>();

export function toastInfo(message: string) {
  toastRef.current?.hide(() => {
    toastRef.current?.show(message, 'info', 300);
  });
}

export function toastHide() {
  toastRef.current?.hide();
}

export function toastSuccess(successMessage: string) {
  toastRef.current?.hide(() => {
    toastRef.current?.show(successMessage, 'success', 300);
  });
}

export function toastError(errorMessage: string) {
  toastRef.current?.hide(() => {
    toastRef.current?.show(errorMessage, 'error', 300);
  });
}
