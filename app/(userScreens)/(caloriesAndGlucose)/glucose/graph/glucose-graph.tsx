import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Image } from 'react-native';

import ActionCard from '~/components/cards/action-card';
import GlucoseGraphCard from '~/components/cards/glucose-chart-card';
import SummaryCard from '~/components/cards/summary-card';
import { GlucoseReading } from '~/types/common/glucose';
import { colorBrown } from '~/utils';

export default function GlucoseGraph() {
  const user = auth().currentUser;
  const [currentDate, setCurrentDate] = useState<Date>(new Date(Date.now()));

  const [totalGlucoseToday, setTotalGlucoseToday] = useState<GlucoseReading[]>([]);
  const userId = user?.uid || '';

  async function fetchAllGlucoseReadingForToday(timestamp: Date) {
    const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
    const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59

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

  useEffect(() => {
    fetchAllGlucoseReadingForToday(currentDate);
  }, [currentDate]);

  return (
    <ScrollView
      style={{
        height: '100%',
        flex: 1,
        position: 'relative',
        backgroundColor: 'white',
      }}>
      <GlucoseGraphCard currentDate={currentDate} setCurrentDate={setCurrentDate} />
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
            href="/(userScreens)/(caloriesAndGlucose)/glucose/glucose-logging"
            title="Add Glucose Reading"
            description="Log your glucose reading"
            imageKey="glucoseInput"
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
      </View>
    </ScrollView>
  );
}
