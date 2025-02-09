import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import {
  fetchAllGlucosePredictionForToday,
  fetchCaloriesConsumed,
  fetchCaloriesConsumedOverall,
  fetchCaloriesOutput,
  fetchGlucoseReadingsOverall,
  predictGlucose,
} from '~/actions/actions';
import { PersonalInformationType } from '~/app/(userScreens)/(settings)/profile/profile';
import FunctionTiedButton from '~/components/FunctionTiedButton';
import { CustomAlert } from '~/components/alert-dialog/custom-alert-dialog';
import CaloriesGlucoseCorrelationCard from '~/components/cards/co-relations-graph-card';
import Toast from '~/components/notifications/toast';
import { PersonalInformation } from '~/components/profiles/personal-informations';
import { useUserProfile } from '~/ctx';
import { CaloriesOutputTracking, CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';
import {
  colorGreen,
  currentUser,
  formatFirestoreTime,
  toastError,
  toastRef,
  toastSuccess,
} from '~/utils';

export default function GlucosePrediction() {
  const { profile } = useUserProfile();
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));
  const [caloriesConsumedOverall, setCaloriesConsumedOverall] = useState<CaloriesTracking[]>([]);

  const [claoriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const [caloriesOutputToday, setCaloriesOutputToday] = useState<CaloriesOutputTracking[]>([]);
  const [glucoseOverall, setGlucoseOverall] = useState<GlucoseReading[]>([]);
  const [glucosePrediction, setGlucosePrediction] = useState<GlucoseReading[]>([]);

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const userId = currentUser?.uid || '';

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === '') return 0;

    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  const getAverageCaloriesConsumedByDay = (caloriesConsumed: CaloriesTracking[]) => {
    if (!caloriesConsumed.length) return 0;

    const convertToDate = (timestamp: any): Date => {
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
      } else if (typeof timestamp === 'object' && 'seconds' in timestamp) {
        return new Date(timestamp.seconds * 1000);
      } else {
        return new Date(timestamp);
      }
    };

    const dates = caloriesConsumed.map((entry) => convertToDate(entry.timestamp));
    const minDate = new Date(Math.min(...dates.map((date) => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())));

    if (isNaN(minDate.getTime()) || isNaN(maxDate.getTime())) {
      console.warn('Invalid date detected in CaloriesTracking data.');
      return 0;
    }

    const days = Math.max(
      1,
      Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    const totalCalories = caloriesConsumed.reduce((acc, curr) => acc + curr.amount, 0);

    return Math.round((totalCalories / days) * 100) / 100;
  };

  const calculateAge = (birthdate: string | undefined) => {
    if (!birthdate) return 0;

    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const bmr = calculateBMR(
    profile?.weight || 0,
    profile?.height || 0,
    calculateAge(profile?.birthDate),
    profile?.gender || ''
  );

  const personalInformation: PersonalInformationType[] = [
    {
      title: `Weight: ${profile?.weight || 0} kg`,
      icon: <MaterialIcons name="monitor-weight" size={24} color="white" />,
    },
    {
      title: `Height: ${profile?.height || 0} cm`,
      icon: <MaterialIcons name="height" size={24} color="white" />,
    },
    {
      title: calculateAge(profile?.birthDate).toString(),
      icon: (
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
          Age
        </Text>
      ),
    },

    {
      title: profile?.gender || '',
      icon:
        profile?.gender === 'male' ? (
          <MaterialCommunityIcons name="gender-male" size={24} color="white" />
        ) : (
          <MaterialCommunityIcons name="gender-female" size={24} color="white" />
        ),
    },
  ];

  const saveGlucoseReadings = async (
    predictions: { reading: number; timestamp: string }[],
    userId: string
  ) => {
    if (!predictions || predictions.length === 0) {
      toastError('Glucose Prediction failed');
      return;
    }

    try {
      const db = firestore();
      const predictionRef = db.collection(`accounts/${userId}/glucose-prediction-logs`);
      const batch = db.batch();

      const existingDocs = await predictionRef.get();
      existingDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      predictions.forEach((prediction) => {
        const newDocRef = predictionRef.doc(); // Create new document
        batch.set(newDocRef, {
          reading: prediction.reading,
          unit: 'mmol/L',
          timestamp: new Date(prediction.timestamp), // Store as a Date object
        });
      });

      await batch.commit();

      toastSuccess('Glucose Predictions Saved Successfully');
    } catch (error) {
      console.error('Error saving glucose predictions:', error);
      toastError('Failed to save glucose predictions');
    }
  };

  const handlePredictGlucose = async () => {
    try {
      setLoading(true);

      const db = firestore();
      const predictionRef = db.collection(`accounts/${userId}/glucose-prediction-logs`);

      const latestPredictionSnapshot = await predictionRef
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!latestPredictionSnapshot.empty) {
        const latestPrediction = latestPredictionSnapshot.docs[0].data();
        const lastPredictionTime = new Date(latestPrediction.timestamp.toDate()); // Convert Firestore Timestamp to Date

        const now = new Date();
        const timeDiffHours = (now.getTime() - lastPredictionTime.getTime()) / (1000 * 60 * 60); // Convert ms to hours

        if (timeDiffHours < 4) {
          setVisible(true);
          setLoading(false);
          return;
        }
      }

      const predictions = await predictGlucose(
        glucoseOverall,
        bmr,
        claoriesConsumedToday,
        caloriesOutputToday
      );

      setLoading(false);

      if (!Array.isArray(predictions) || predictions.length !== 3) {
        console.error('Invalid OpenAI response format:', predictions);
        toastError('Glucose Prediction failed');
        return;
      }

      await saveGlucoseReadings(predictions, userId);
    } catch (error) {
      console.error('Error predicting glucose:', error);
      toastError('Error predicting glucose');
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsbuscribeCaloriesConsumedOverall: () => void;
    let unsubscribeCaloriesConsumedToday: () => void;
    let unsubscribeCaloriesOutputToday: () => void;
    let unsubscribeGlucoseOverall: () => void;
    let unsubscribeGlucosePrediction: () => void;

    (async () => {
      unsbuscribeCaloriesConsumedOverall = await fetchCaloriesConsumedOverall(
        userId,
        setCaloriesConsumedOverall
      );
      unsubscribeCaloriesConsumedToday = await fetchCaloriesConsumed(
        currentDate,
        userId,
        setCaloriesConsumedToday
      );
      unsubscribeCaloriesOutputToday = await fetchCaloriesOutput(
        currentDate,
        userId,
        setCaloriesOutputToday
      );
      unsubscribeGlucoseOverall = await fetchGlucoseReadingsOverall(userId, setGlucoseOverall);
      unsubscribeGlucosePrediction = await fetchAllGlucosePredictionForToday(
        userId,
        setGlucosePrediction
      );
    })();

    return () => {
      if (unsbuscribeCaloriesConsumedOverall) unsbuscribeCaloriesConsumedOverall();
      if (unsubscribeCaloriesConsumedToday) unsubscribeCaloriesConsumedToday();
      if (unsubscribeCaloriesOutputToday) unsubscribeCaloriesOutputToday();
      if (unsubscribeGlucoseOverall) unsubscribeGlucoseOverall();
      if (unsubscribeGlucosePrediction) unsubscribeGlucosePrediction();
    };
  }, [currentDate, userId]);

  return (
    <ScrollView
      style={{
        backgroundColor: colorGreen,
      }}>
      <Toast ref={toastRef} />
      <CustomAlert
        visible={visible}
        title="Error Predicting glucose."
        message="You can only predict glucose once every 4 hours."
        onClose={() => setVisible(false)}
        error
      />
      <Text
        style={{
          color: 'white',
          fontSize: 20,
          fontWeight: 'bold',
          marginTop: 20,
          paddingHorizontal: 20,
        }}>
        Glucose Prediction
      </Text>
      <CaloriesGlucoseCorrelationCard
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        color="white"
        showDate={false}
      />
      <View
        style={{
          backgroundColor: 'white',
          margin: 20,
          padding: 20,
          borderRadius: 10,
        }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 10,
            color: 'gray',
          }}>
          Current BMR Measurement
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: colorGreen,
            fontWeight: 'bold',
          }}>
          {getAverageCaloriesConsumedByDay(caloriesConsumedOverall)} kcal/day
        </Text>
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 10,
            color: 'white',
          }}>
          BMR Factors
        </Text>
        {personalInformation.map((info, index) => (
          <PersonalInformation key={index} {...info} />
        ))}
      </View>

      <View
        style={{
          marginTop: 20,
          marginHorizontal: 30,
        }}>
        {glucosePrediction.length > 0 &&
          glucosePrediction.map((glucose, index) => (
            <View
              key={index}
              style={{
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 10,
                marginVertical: 10,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 5,
                }}>
                Prediction Set {index + 1}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 5,
                }}>
                Time: {formatFirestoreTime(glucose.timestamp)}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                }}>
                Glucose Level: {Math.floor(glucose.reading * 100) / 100} mmol/L
              </Text>
            </View>
          ))}
      </View>

      {loading ? (
        <ActivityIndicator
          style={{
            marginVertical: 40,
            marginHorizontal: 'auto',
          }}
          size="large"
        />
      ) : (
        <FunctionTiedButton
          onPress={handlePredictGlucose}
          title="Predict Glucose"
          buttonStyle={{
            backgroundColor: 'white',
            paddingHorizontal: 10,
            borderRadius: 30,
            width: '80%',
            marginVertical: 40,
            marginHorizontal: 'auto',
          }}
          textStyle={{
            fontFamily: 'Poppins',
            fontSize: 20,
            color: colorGreen,
            padding: 10,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        />
      )}
    </ScrollView>
  );
}
