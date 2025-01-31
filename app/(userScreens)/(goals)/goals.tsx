import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import ProgressCard from '~/components/cards/progress-card';
import { useUserProfile } from '~/ctx';
import { CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';
import { colorViolet } from '~/utils';

export default function Goals() {
  const { profile } = useUserProfile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [caloriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const [totalGlucoseToday, setTotalGlucoseToday] = useState<GlucoseReading[]>([]);

  const totalGlucose = totalGlucoseToday.reduce((acc, curr) => acc + curr.reading, 0);
  const totalCalories = caloriesConsumedToday.reduce((acc, curr) => acc + curr.amount, 0);

  const router = useRouter();

  async function fetchCaloriesConsumed(timestamp: Date) {
    const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
    const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59

    const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = firestore.Timestamp.fromDate(endOfDay);
    const user = auth().currentUser;
    const userId = user?.uid || '';

    try {
      const documentSnapshot = await firestore()
        .collection(`accounts/${userId}/calories`)
        .where('type', '==', 'input')
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .get();

      const calories = documentSnapshot.docs.map((doc) => doc.data() as CaloriesTracking);
      setCaloriesConsumedToday(calories);
    } catch (error) {
      console.error('Error fetching caloreis consumed today: ', error);
    }
  }

  async function fetchAllGlucoseReadingForToday(timestamp: Date) {
    const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
    const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59
    const user = auth().currentUser;
    const userId = user?.uid || '';

    const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = firestore.Timestamp.fromDate(endOfDay);

    try {
      const documentSnapshot = await firestore()
        .collection(`accounts/${userId}/glucose-logs`)
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .get();

      const glucoseLogs = documentSnapshot.docs.map((doc) => doc.data() as GlucoseReading);
      setTotalGlucoseToday(glucoseLogs);
    } catch (error) {
      console.error('Error fetching caloreis consumed today: ', error);
    }
  }

  const formatedCurrentDate = currentDate
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');

  useEffect(() => {
    fetchCaloriesConsumed(currentDate);
    fetchAllGlucoseReadingForToday(currentDate);
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
            currentValue={goal.categoryID === 'calories' ? totalCalories : totalGlucose}
            goalValue={goal.max}
            title={goal.categoryID}
            iconName={goal.categoryID === 'calories' ? 'fire' : 'tint'}
          />
        ))}
      </View>
    </View>
  );
}
