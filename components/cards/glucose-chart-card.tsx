import { FontAwesome } from '@expo/vector-icons'; // For calendar icon
import auth from '@react-native-firebase/auth';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { fetchAllGlucoseReadingForToday, fetchGlucoseReadingsOverall } from '~/actions/actions';
import { GlucoseReading } from '~/types/common/glucose';

type GlucoseCardProps = {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  showDate?: boolean;
};

const GlucoseGraphCard = ({ currentDate, setCurrentDate, showDate = true }: GlucoseCardProps) => {
  // const [currentDate, setCurrentDate] = useState(new Date());
  const [glucoseToday, setGlucoseToday] = useState<GlucoseReading[]>([]);
  const [glucoseOverall, setGlucoseOverall] = useState<GlucoseReading[]>([]);

  const user = auth().currentUser;
  const userId = user?.uid || '';

  const formatedCurrentDate = currentDate
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');

  const getMonthlyGlucoseData = (glucose: GlucoseReading[]) => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyGlucose: { [key: string]: number } = {};

    // Initialize monthly data
    monthLabels.forEach((month) => (monthlyGlucose[month] = 0));

    glucose.forEach((entry) => {
      const date = entry.timestamp;
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);

      if (monthlyGlucose[monthName] !== undefined) {
        // Convert reading unit to mmol/L
        if (entry.unit === 'mg/dL') {
          entry.reading = entry.reading / 18.0182;
        }
        monthlyGlucose[monthName] += entry.reading || 0; // Sum calorie values
      }
    });

    return monthLabels.map((month) => monthlyGlucose[month]);
  };

  const chartData = getMonthlyGlucoseData(glucoseOverall); // Process fetched data

  useEffect(() => {
    let unsubscribeGlucose: () => void;
    let unsubscribeGlucoseOverall: () => void;

    (async () => {
      unsubscribeGlucose = await fetchAllGlucoseReadingForToday(
        currentDate,
        userId,
        setGlucoseToday
      );
      unsubscribeGlucoseOverall = await fetchGlucoseReadingsOverall(userId, setGlucoseOverall);
    })();

    return () => {
      if (unsubscribeGlucose) unsubscribeGlucose();
      if (unsubscribeGlucoseOverall) unsubscribeGlucoseOverall();
    };
  }, [currentDate, userId]);

  return (
    <View style={styles.container}>
      {showDate && (
        <View style={styles.header}>
          <TouchableOpacity
            style={{
              padding: 10,
            }}
            onPress={() => {
              setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
            }}>
            <FontAwesome name="chevron-left" size={18} color="black" />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <FontAwesome name="calendar" size={16} color="black" />
            <Text style={styles.dateText}> {formatedCurrentDate} </Text>
          </View>

          <TouchableOpacity
            style={{
              padding: 10,
            }}
            onPress={() => {
              if (
                currentDate.toISOString().split('T')[0] >= new Date().toISOString().split('T')[0]
              ) {
                return;
              }
              setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
            }}>
            <FontAwesome name="chevron-right" size={18} color="black" />
          </TouchableOpacity>
        </View>
      )}

      {/* Card Content */}
      <View style={styles.card}>
        <Text style={styles.title}>Glucose Readings</Text>
        <Text style={styles.calories}>
          {glucoseToday.reduce((acc, curr) => {
            if (curr.unit === 'mg/dL') {
              return Math.round((acc + curr.reading / 18.0182) * 100) / 100;
            }
            return Math.round((acc + curr.reading) * 100) / 100;
          }, 0)}{' '}
          mmol/L
        </Text>

        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun'],
            datasets: [
              {
                data: chartData, // Example data
              },
            ],
          }}
          width={Dimensions.get('window').width * 0.8} // Adjust to fit card
          xLabelsOffset={-5}
          height={150}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: () => '#333',
            style: {
              borderRadius: 10,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '1',
              stroke: '#555',
            },
          }}
          bezier
          style={styles.chart}
        />

        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Content</Text>
        </View>
      </View>
    </View>
  );
};

export default GlucoseGraphCard;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calories: {
    fontSize: 28,
    color: '#1565C0',
    fontWeight: 'bold',
  },
  orders: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    backgroundColor: 'blue',
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
});
