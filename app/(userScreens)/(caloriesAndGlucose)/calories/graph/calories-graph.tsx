import { FontAwesome } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Image } from 'react-native';

import CaloriesConsumedCard from '~/components/calories-chart-card/calories-consumed-card';
import ActionCard from '~/components/cards/action-card';
import SummaryCard from '~/components/cards/summary-card';
import { CaloriesTracking } from '~/types/common/calories';
import { colorBrown } from '~/utils';

export default function CaloriesGraph() {
  const user = auth().currentUser;
  const [currentDate, setCurrentDate] = useState<Date>(new Date(Date.now()));

  const [caloriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const userId = user?.uid || '';

  async function fetchCaloriesConsumed(timestamp: Date) {
    const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
    const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59

    const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = firestore.Timestamp.fromDate(endOfDay);

    try {
      const documentSnapshot = await firestore()
        .collection(`accounts/${userId}/calories`)
        .where('userID', '==', userId)
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

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true, // Enables 12-hour format
    }).format(date);
  };

  useEffect(() => {
    fetchCaloriesConsumed(currentDate);
  }, [currentDate]);

  return (
    <ScrollView
      style={{
        height: '100%',
        flex: 1,
        position: 'relative',
        backgroundColor: 'white',
      }}>
      <CaloriesConsumedCard currentDate={currentDate} setCurrentDate={setCurrentDate} />
      <View
        style={{
          padding: 20,
          marginTop: 20,
        }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
            color: colorBrown,
          }}>
          Actions
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 10,
          }}>
          <ActionCard
            href="/(userScreens)/(caloriesAndGlucose)/calories/cookedMeals"
            title="Add Calories Input"
            description="Log Food Consumption"
            imageKey="caloriesInput"
          />
          <ActionCard
            href="/"
            title="Add Calories Output"
            description="Log Food Output"
            imageKey="caloriesOutput"
          />
        </View>
      </View>
      <View
        style={{
          padding: 20,
        }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 15,
            color: colorBrown,
          }}>
          Graphed Data
        </Text>
        <Text
          style={{
            fontSize: 16,
            marginBottom: 10,
          }}>
          Data Movement
        </Text>
        <View>
          {caloriesConsumedToday.map((item, index) => (
            <SummaryCard
              key={index}
              title={item.food_info.name}
              calories={item.amount}
              image={
                <Image
                  source={{ uri: item.food_info.image_url }}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
              }
              type={item.type}
              timestamp={item.timestamp}
              unit="kcal"
            />
          ))}
          <View
            style={{
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 10,
              padding: 15,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: 'gray',
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'white',
                  }}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    width: 130,
                    marginBottom: 5,
                  }}>
                  Net Calories Intake
                </Text>
                <Text
                  style={{
                    color: 'gray',
                  }}>
                  {caloriesConsumedToday.reduce((acc, item) => acc + item.amount, 0)} kcal
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 10,
                  }}>
                  <FontAwesome
                    style={{
                      marginRight: 10,
                    }}
                    name="calendar"
                    size={16}
                    color="black"
                  />
                  <Text>{formatDate(new Date())}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <FontAwesome
                    style={{
                      marginRight: 10,
                    }}
                    name="clock-o"
                    size={16}
                    color="black"
                  />
                  <Text>{formatTime(new Date())}</Text>
                </View>
              </View>
            </View>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                textTransform: 'uppercase',
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
