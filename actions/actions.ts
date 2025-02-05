import firestore from '@react-native-firebase/firestore';

import { CaloriesOutputTracking, CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';

export async function fetchCaloriesConsumed(
  timestamp: Date,
  userId: string,
  setCaloriesConsumedToday: (data: CaloriesTracking[]) => void
): Promise<() => void> {
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
