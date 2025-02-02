import { FontAwesome } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Image } from 'react-native';

import { fetchCaloriesConsumed, fetchCaloriesOutput } from '~/actions/actions';
import CaloriesConsumedCard from '~/components/calories-chart-card/calories-consumed-card';
import ActionCard from '~/components/cards/action-card';
import SummaryCard from '~/components/cards/summary-card';
import { CaloriesOutputTracking, CaloriesTracking } from '~/types/common/calories';
import { colorBrown } from '~/utils';

export default function CaloriesGraph() {
  const user = auth().currentUser;
  const [currentDate, setCurrentDate] = useState<Date>(new Date(Date.now()));

  const [caloriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const [caloriesOutputToday, setCaloriesOutputToday] = useState<CaloriesOutputTracking[]>([]);
  const userId = user?.uid || '';

  const netCaloriesIntake =
    caloriesConsumedToday.reduce((acc, item) => acc + item.amount, 0) -
    caloriesOutputToday.reduce((acc, item) => acc + item.amount, 0);

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
    let unsubscribeConsumed: () => void;
    let unsubscribeOutput: () => void;

    (async () => {
      unsubscribeConsumed = await fetchCaloriesConsumed(
        currentDate,
        userId,
        setCaloriesConsumedToday
      );
      unsubscribeOutput = await fetchCaloriesOutput(currentDate, userId, setCaloriesOutputToday);
    })();

    return () => {
      if (unsubscribeConsumed) unsubscribeConsumed(); // ✅ Cleanup Firestore listener for consumed calories
      if (unsubscribeOutput) unsubscribeOutput(); // ✅ Cleanup Firestore listener for output calories
    };
  }, [currentDate, userId]);

  return (
    <ScrollView
      style={{
        height: '100%',
        flex: 1,
        position: 'relative',
        backgroundColor: 'white',
      }}>
      <CaloriesConsumedCard
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        netCaloriesConsumed={netCaloriesIntake}
      />
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
            href="/(userScreens)/(caloriesAndGlucose)/calories/output/activityGateway"
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
                  source={require('~/assets/routeImages/calo_input.jpg')}
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
          {caloriesOutputToday.map((item, index) => (
            <SummaryCard
              key={index}
              title={item.MET_task?.name as string || item.StepTrack?.name as string}
              calories={Math.round(item.amount * 100) / 100}
              image={
                <Image
                  source={require('~/assets/routeImages/calo_output.jpg')}
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
                  {Math.round(netCaloriesIntake * 100) / 100} kcal
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
