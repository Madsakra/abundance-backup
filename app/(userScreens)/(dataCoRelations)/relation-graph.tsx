import { FontAwesome } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import {
  fetchAllGlucoseReadingForToday,
  fetchCaloriesConsumed,
  fetchCaloriesOutput,
} from '~/actions/actions';
import ActionCard from '~/components/cards/action-card';
import CaloriesGlucoseCorrelationCard from '~/components/cards/co-relations-graph-card';
import SummaryCard from '~/components/cards/summary-card';
import Toast from '~/components/notifications/toast';
import { useUserAccount } from '~/ctx';
import { CaloriesOutputTracking, CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';
import { colorGreen, toastInfo, toastRef } from '~/utils';

export default function RelationGraph() {
  const user = auth().currentUser;
  const userId = user?.uid || '';
  const { membershipTier } = useUserAccount();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));
  const [caloriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const [caloriesOutputToday, setCaloriesOutputToday] = useState<CaloriesOutputTracking[]>([]);

  const [totalGlucoseToday, setTotalGlucoseToday] = useState<GlucoseReading[]>([]);

  useEffect(() => {
    let unsubscribeConsumed: () => void;
    let unsubscribeOutput: () => void;
    let unsubscribeGlucose: () => void;

    (async () => {
      unsubscribeConsumed = await fetchCaloriesConsumed(
        currentDate,
        userId,
        setCaloriesConsumedToday
      );
      unsubscribeOutput = await fetchCaloriesOutput(currentDate, userId, setCaloriesOutputToday);
      unsubscribeGlucose = await fetchAllGlucoseReadingForToday(
        currentDate,
        userId,
        setTotalGlucoseToday
      );
    })();

    return () => {
      if (unsubscribeConsumed) unsubscribeConsumed();
      if (unsubscribeOutput) unsubscribeOutput();
      if (unsubscribeGlucose) unsubscribeGlucose();
    };
  }, [currentDate, userId]);

  return (
    <ScrollView
      style={{
        backgroundColor: 'white',
      }}>
      <CaloriesGlucoseCorrelationCard
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        showDate={false}
      />
      <Toast ref={toastRef} />
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginTop: 20,
          color: colorGreen,
          paddingHorizontal: 20,
        }}>
        Actions
      </Text>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 20,
          paddingHorizontal: 20,
        }}>
        <Pressable
          onPress={() => {
            if (membershipTier?.status !== 'active') {
              toastInfo('Upgrade to premium to use this feature.');
              return;
            }
            router.push(
              '/(userScreens)/(caloriesAndGlucose)/glucose/prediction/glucose-prediction'
            );
          }}
          style={{
            display: 'flex',
            gap: 10,
            padding: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'gray',
            backgroundColor: 'white',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
          }}>
          <Text
            style={{
              color: colorGreen,
              fontWeight: 'bold',
            }}>
            Predict Glucose
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 10,
              justifyContent: 'center',
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
              <Image
                source={require('~/assets/routeImages/chart_data.jpg')}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
              />
            </View>
            <Text
              style={{
                color: colorGreen,
                width: 120,
              }}>
              Predict glucose with your data
            </Text>
          </View>
          <View
            style={{
              marginLeft: 'auto',
            }}>
            <FontAwesome name="chevron-right" size={12} color="black" />
          </View>
        </Pressable>
        <ActionCard
          href="/(userScreens)/(requestAdvice)/viewNutritionists"
          title="Request Feedback"
          description="Request Feedback from nutritionist"
          imageKey="requestFeedBack"
          color={colorGreen}
        />
      </View>
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginTop: 20,
          color: colorGreen,
          paddingHorizontal: 20,
        }}>
        Graph Data
      </Text>

      <View
        style={{
          marginVertical: 20,
          paddingHorizontal: 20,
        }}>
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
            title={(item.MET_task?.name as string) || (item.StepTrack?.name as string)}
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
        {totalGlucoseToday.map((item, index) => (
          <SummaryCard
            key={index}
            title="Glucose Reading"
            calories={item.reading}
            image={
              <Image
                source={require('~/assets/routeImages/glucose_log.jpg')}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
              />
            }
            type={`${item.reading} ${item.unit}`}
            timestamp={item.timestamp}
            unit={item.unit}
          />
        ))}
      </View>
    </ScrollView>
  );
}
