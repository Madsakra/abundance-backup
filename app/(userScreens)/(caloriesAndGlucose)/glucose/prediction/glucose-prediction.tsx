import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Timestamp } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import {
  fetchCaloriesConsumed,
  fetchCaloriesConsumedOverall,
  fetchCaloriesOutput,
  fetchGlucoseReadingsOverall,
  predictGlucose,
} from '~/actions/actions';
import { PersonalInformationType } from '~/app/(userScreens)/(settings)/profile/profile';
import FunctionTiedButton from '~/components/FunctionTiedButton';
import CaloriesGlucoseCorrelationCard from '~/components/cards/co-relations-graph-card';
import { PersonalInformation } from '~/components/profiles/personal-informations';
import { useUserProfile } from '~/ctx';
import { CaloriesOutputTracking, CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';
import { colorGreen, currentUser } from '~/utils';

export default function GlucosePrediction() {
  const { profile } = useUserProfile();
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));
  const [caloriesConsumedOverall, setCaloriesConsumedOverall] = useState<CaloriesTracking[]>([]);

  const [claoriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const [caloriesOutputToday, setCaloriesOutputToday] = useState<CaloriesOutputTracking[]>([]);
  const [glucoseOverall, setGlucoseOverall] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handlePredictGlucose = async () => {
    try {
      setLoading(true);

      const predictionData = await predictGlucose(
        glucoseOverall,
        bmr,
        claoriesConsumedToday,
        caloriesOutputToday
      );

      setLoading(false);

      console.log('Prediction Data:', predictionData);
    } catch (error) {
      console.error('Error predicting glucose:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsbuscribeCaloriesConsumedOverall: () => void;
    let unsubscribeCaloriesConsumedToday: () => void;
    let unsubscribeCaloriesOutputToday: () => void;
    let unsubscribeGlucoseOverall: () => void;

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
    })();

    return () => {
      if (unsbuscribeCaloriesConsumedOverall) unsbuscribeCaloriesConsumedOverall();
      if (unsubscribeCaloriesConsumedToday) unsubscribeCaloriesConsumedToday();
      if (unsubscribeCaloriesOutputToday) unsubscribeCaloriesOutputToday();
      if (unsubscribeGlucoseOverall) unsubscribeGlucoseOverall();
    };
  }, [currentDate, userId]);

  return (
    <ScrollView
      style={{
        backgroundColor: colorGreen,
      }}>
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
