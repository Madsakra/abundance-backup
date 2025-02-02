import auth from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Image } from 'react-native';

import { fetchAllGlucoseReadingForToday } from '~/actions/actions';
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

  useEffect(() => {
    let unsubscribeGlucose: () => void;

    (async () => {
      unsubscribeGlucose = await fetchAllGlucoseReadingForToday(
        currentDate,
        userId,
        setTotalGlucoseToday
      );
    })();

    return () => {
      if (unsubscribeGlucose) unsubscribeGlucose();
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
            href="/(caloriesAndGlucose)/glucose/glucose-logging?glucoseLevel=0%20mmo%2FL"
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
