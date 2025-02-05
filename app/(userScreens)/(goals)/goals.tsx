import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  fetchAllGlucoseReadingForToday,
  fetchCaloriesConsumed,
  fetchCaloriesOutput,
} from '~/actions/actions';
import ProgressCard from '~/components/cards/progress-card';
import { useUserProfile } from '~/ctx';
import { CaloriesOutputTracking, CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';
import { colorViolet } from '~/utils';

export default function Goals() {
  const { profile } = useUserProfile();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [caloriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const [caloriesOutputToday, setCaloriesOutputToday] = useState<CaloriesOutputTracking[]>([]);
  const [totalGlucoseToday, setTotalGlucoseToday] = useState<GlucoseReading[]>([]);

  const totalGlucose = totalGlucoseToday.reduce((acc, curr) => acc + curr.reading, 0);

  const totalCalories =
    caloriesConsumedToday.reduce((acc, curr) => acc + curr.amount, 0) -
    caloriesOutputToday.reduce((acc, curr) => acc + curr.amount, 0);

  const router = useRouter();
  const user = auth().currentUser;
  const userId = user?.uid || '';

  const formatedCurrentDate = currentDate
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');

  useEffect(() => {
    let unsubscribeCaloriesConsumed: () => void;
    let unsubscribeCaloriesOutput: () => void;
    let unsubscribeGlucose: () => void;

    (async () => {
      unsubscribeCaloriesConsumed = await fetchCaloriesConsumed(
        currentDate,
        userId,
        setCaloriesConsumedToday
      );
      unsubscribeCaloriesOutput = await fetchCaloriesOutput(
        currentDate,
        userId,
        setCaloriesOutputToday
      );
      unsubscribeGlucose = await fetchAllGlucoseReadingForToday(
        currentDate,
        userId,
        setTotalGlucoseToday
      );
    })();

    return () => {
      if (unsubscribeCaloriesConsumed) unsubscribeCaloriesConsumed();
      if (unsubscribeCaloriesOutput) unsubscribeCaloriesOutput();
      if (unsubscribeGlucose) unsubscribeGlucose();
    };
  }, [currentDate]);

  return (
    <View
      style={{
        backgroundColor: 'white',
        height: '100%',
        alignItems: 'center',
        paddingTop: 20,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '90%',
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={{
            padding: 10,
          }}
          onPress={() => {
            setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
          }}>
          <FontAwesome name="chevron-left" size={18} color={colorViolet} />
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <FontAwesome name="calendar" size={16} color={colorViolet} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colorViolet,
            }}>
            {formatedCurrentDate}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            padding: 10,
          }}
          onPress={() => {
            if (currentDate.toISOString().split('T')[0] > new Date().toISOString().split('T')[0]) {
              return;
            }
            setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
          }}>
          <FontAwesome name="chevron-right" size={18} color={colorViolet} />
        </TouchableOpacity>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '80%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
          }}>
          Current Progress
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.push('/(userScreens)/(goals)/edit-goals/edit-goals');
          }}
          style={{
            padding: 10,
            backgroundColor: colorViolet,
            borderRadius: 5,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}>
          <Text
            style={{
              color: 'white',
            }}>
            Edit Goals
          </Text>
          <MaterialIcons name="edit" size={16} color="white" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: '80%',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginTop: 20,
        }}>
        {profile?.goals.map((goal, index) => (
          <ProgressCard
            key={index}
            currentValue={
              goal.categoryID === 'calories'
                ? Math.round(totalCalories * 100) / 100
                : Math.round(totalGlucose * 100) / 100
            }
            goalValue={goal.max}
            title={goal.categoryID}
            iconName={goal.categoryID === 'calories' ? 'fire' : 'tint'}
          />
        ))}
      </View>
    </View>
  );
}
