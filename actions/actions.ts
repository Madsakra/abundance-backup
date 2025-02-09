import firestore, { Timestamp } from '@react-native-firebase/firestore';
import OpenAI from 'openai';

import { CaloriesOutputTracking, CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';
import { OPENAI_API_KEY } from '~/utils';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function fetchCaloriesConsumed(
  timestamp: Date,
  userId: string,
  setCaloriesConsumedToday: (data: CaloriesTracking[]) => void
): Promise<() => void> {
  if (userId === '') {
    return () => {};
  }

  const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
  const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59

  const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
  const endTimestamp = firestore.Timestamp.fromDate(endOfDay);

  return firestore()
    .collection(`accounts/${userId}/calories`)
    .where('type', '==', 'input')
    .where('timestamp', '>=', startTimestamp)
    .where('timestamp', '<=', endTimestamp)
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.empty) {
          const calories = snapshot.docs.map((doc) => doc.data() as CaloriesTracking);
          setCaloriesConsumedToday(calories);
        } else {
          setCaloriesConsumedToday([]); // Set empty if no data found
        }
      },
      (error) => {
        console.error('Error fetching real-time calorie input:', error);
      }
    );
}

export async function fetchCaloriesConsumedLatest(
  userId: string,
  setCaloriesComsumedLatest: (data: CaloriesTracking | null) => void
): Promise<() => void> {
  if (userId === '') {
    return () => {};
  }
  return firestore()
    .collection(`accounts/${userId}/calories`)
    .where('type', '==', 'input')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.empty) {
          const calories = snapshot.docs[0].data() as CaloriesTracking;
          setCaloriesComsumedLatest(calories);
        } else {
          setCaloriesComsumedLatest(null); // Set empty if no data found
        }
      },
      (error) => {
        console.error('Error fetching real-time calorie input:', error);
      }
    );
}

export async function fetchCaloriesOutput(
  timestamp: Date,
  userId: string,
  setCaloriesOutputToday: (data: CaloriesOutputTracking[]) => void
): Promise<() => void> {
  if (userId === '') {
    return () => {};
  }
  const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
  const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59

  const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
  const endTimestamp = firestore.Timestamp.fromDate(endOfDay);

  return firestore()
    .collection(`accounts/${userId}/calories`)
    .where('type', '==', 'output')
    .where('timestamp', '>=', startTimestamp)
    .where('timestamp', '<=', endTimestamp)
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.empty) {
          const calories = snapshot.docs.map((doc) => doc.data() as CaloriesOutputTracking);
          setCaloriesOutputToday(calories);
        } else {
          setCaloriesOutputToday([]); // If no data, set empty array
        }
      },
      (error) => {
        console.error('Error fetching real-time calorie output:', error);
      }
    );
}

export async function fetchCaloriesConsumedOverall(
  userId: string,
  setCaloriesConsumed: (data: CaloriesTracking[]) => void
): Promise<() => void> {
  if (userId === '') {
    return () => {};
  }
  try {
    return firestore()
      .collection(`accounts/${userId}/calories`)
      .where('type', '==', 'input')
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const calories = snapshot.docs.map((doc) => doc.data() as CaloriesTracking);
            setCaloriesConsumed(calories);
          } else {
            setCaloriesConsumed([]); // Set empty if no data found
          }
        },
        (error) => {
          console.error('Error fetching real-time calorie input:', error);
        }
      );
  } catch (error) {
    console.error('Error setting up real-time listener for calories:', error);
    return () => {}; // Return an empty function in case of an error
  }
}

export async function fetchAllGlucoseReadingForToday(
  timestamp: Date,
  userId: string,
  setTotalGlucoseToday: (data: GlucoseReading[]) => void
): Promise<() => void> {
  if (userId === '') {
    return () => {};
  }
  const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
  const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59

  const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
  const endTimestamp = firestore.Timestamp.fromDate(endOfDay);

  try {
    return firestore()
      .collection(`accounts/${userId}/glucose-logs`)
      .where('timestamp', '>=', startTimestamp)
      .where('timestamp', '<=', endTimestamp)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const glucoseLogs = snapshot.docs.map((doc) => doc.data() as GlucoseReading);
            setTotalGlucoseToday(glucoseLogs);
          } else {
            setTotalGlucoseToday([]); // Set empty if no data found
          }
        },
        (error) => {
          console.error('Error fetching real-time glucose readings:', error);
        }
      );
  } catch (error) {
    console.error('Error setting up real-time listener for glucose logs:', error);
    return () => {}; // Return an empty function in case of an error
  }
}

export async function fetchGlucoseReadingsOverall(
  userId: string,
  setGlucoseOverall: (data: GlucoseReading[]) => void
): Promise<() => void> {
  if (userId === '') {
    return () => {};
  }
  try {
    return firestore()
      .collection(`accounts/${userId}/glucose-logs`)
      .onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const glucose = snapshot.docs.map((doc) => doc.data() as GlucoseReading);
            setGlucoseOverall(glucose);
          } else {
            setGlucoseOverall([]); // Set empty if no data found
          }
        },
        (error) => {
          console.error('Error fetching real-time glucose readings:', error);
        }
      );
  } catch (error) {
    console.error('Error setting up real-time listener for glucose logs:', error);
    return () => {}; // Return an empty function in case of an error
  }
}

export async function fetchGlucoseLatest(
  userId: string,
  setGlucoseLatest: (data: GlucoseReading | null) => void
): Promise<() => void> {
  if (userId === '') {
    return () => {};
  }
  return firestore()
    .collection(`accounts/${userId}/glucose-logs`)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.empty) {
          const glucose = snapshot.docs[0].data() as GlucoseReading;
          console.log('glucose', glucose);
          setGlucoseLatest(glucose);
        } else {
          setGlucoseLatest(null);
        }
      },
      (error) => {
        console.error('Error fetching real-time calorie input:', error);
      }
    );
}

export async function fetchArticles(setArticles: (articles: any[]) => void): Promise<() => void> {
  return firestore()
    .collectionGroup('written_articles')
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.empty) {
          const articles = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setArticles(articles);
        } else {
          setArticles([]);
        }
      },
      (error) => {
        console.error('Error fetching articles:', error);
      }
    );
}

export async function fetchArticleById(
  articleId: string,
  setArticle: (article: any | null) => void
): Promise<() => void> {
  return firestore()
    .collectionGroup('written_articles')
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.empty) {
          const articles = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const article = articles.filter((article) => article.id === articleId);
          setArticle(article[0]);
        } else {
          setArticle(null);
        }
      },
      (error) => {
        console.error('Error fetching articles:', error);
      }
    );
}

export const predictGlucose = async (
  pastGlucoseData: GlucoseReading[],
  bmr: number,
  caloriesIntake: CaloriesTracking[],
  caloriesOutput: CaloriesOutputTracking[]
) => {
  const convertToDate = (timestamp: any): Date => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    } else if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000);
    } else {
      return new Date(timestamp);
    }
  };

  const formattedGlucoseData = pastGlucoseData.map((entry) => ({
    timestamp: convertToDate(entry.timestamp).toISOString(),
    reading: entry.unit === 'mg/dL' ? entry.reading / 18.0182 : entry.reading, // Convert mg/dL to mmol/L
  }));

  const formattedFoodIntake = caloriesIntake.map((food) => ({
    timestamp: convertToDate(food.timestamp).toISOString(),
    calories: food.amount,
    carbs: food.food_info.carbs,
    fats: food.food_info.fats,
    protein: food.food_info.protein,
    food_name: food.food_info.name,
  }));

  const formattedCaloriesOutput = caloriesOutput.map((activity) => ({
    timestamp: convertToDate(activity.timestamp).toISOString(),
    calories_burned: activity.amount,
    activity_name: activity.MET_task?.name || activity.StepTrack?.name || 'Unknown',
    steps: activity.StepTrack?.steps || 0,
    distance: activity.StepTrack?.distance || 0,
  }));

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `
        Predict the next glucose reading from the current time: ${new Date().toISOString()}.
        - Past glucose readings: ${JSON.stringify(formattedGlucoseData)}
        - BMR: ${bmr}
        - Recent food intake: ${JSON.stringify(formattedFoodIntake)}
        - Recent calories burned: ${JSON.stringify(formattedCaloriesOutput)}

        Respond with only a JSON object in this format:
        { "reading": number, "timestamp": string } // Timestamp should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
        `,
      },
    ],
    max_tokens: 50,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  try {
    if (!response.choices || !response.choices[0]?.message?.content) {
      throw new Error('Empty or invalid OpenAI response');
    }

    const prediction = response.choices[0].message.content;

    return prediction;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    return null;
  }
};
