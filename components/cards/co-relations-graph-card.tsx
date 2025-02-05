import { FontAwesome } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { fetchCaloriesConsumedOverall, fetchAllGlucoseReadingForToday } from '~/actions/actions';
import { CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';

type CorrelationCardProps = {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  showDate?: boolean;
};

const CaloriesGlucoseCorrelationCard = ({
  currentDate,
  setCurrentDate,
  showDate = true,
}: CorrelationCardProps) => {
  const [caloriesConsumed, setCaloriesConsumed] = useState<CaloriesTracking[]>([]);
  const [glucoseOverall, setGlucoseOverall] = useState<GlucoseReading[]>([]);

  const user = auth().currentUser;
  const userId = user?.uid || '';

  const formattedCurrentDate = currentDate
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');

  const getMonthlyData = (caloriesConsumed: CaloriesTracking[], glucose: GlucoseReading[]) => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const monthlyCalories: { [key: string]: number } = {};
    const monthlyGlucose: { [key: string]: number } = {};

    // Initialize months
    monthLabels.forEach((month) => {
      monthlyCalories[month] = 0;
      monthlyGlucose[month] = 0;
    });

    // Aggregate Calories Data
    caloriesConsumed.forEach((entry) => {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        entry.timestamp
      );
      if (monthlyCalories[monthName] !== undefined) {
        monthlyCalories[monthName] += entry.amount || 0;
      }
    });

    // Aggregate Glucose Data
    glucose.forEach((entry) => {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
        entry.timestamp
      );
      if (monthlyGlucose[monthName] !== undefined) {
        // Convert glucose to mmol/L if it's in mg/dL
        const value = entry.unit === 'mg/dL' ? entry.reading / 18.0182 : entry.reading;
        monthlyGlucose[monthName] += value;
      }
    });

    // Find max values separately
    const maxCalories = Math.max(...Object.values(monthlyCalories), 1);
    const maxGlucose = Math.max(...Object.values(monthlyGlucose), 1);

    // Scale glucose relative to calories, using a dynamic multiplier
    const scaleFactor = maxCalories / maxGlucose > 10 ? maxCalories / 10 : maxCalories / 3;

    const scaledGlucoseData = monthLabels.map((month) => monthlyGlucose[month] * scaleFactor);

    return {
      labels: monthLabels,
      caloriesData: monthLabels.map((month) => monthlyCalories[month]),
      glucoseData: scaledGlucoseData,
    };
  };

  useEffect(() => {
    let unsubscribeCalories: () => void;
    let unsubscribeGlucose: () => void;

    (async () => {
      unsubscribeCalories = await fetchCaloriesConsumedOverall(userId, setCaloriesConsumed);
      unsubscribeGlucose = await fetchAllGlucoseReadingForToday(
        currentDate,
        userId,
        setGlucoseOverall
      );
    })();

    return () => {
      if (unsubscribeCalories) unsubscribeCalories();
      if (unsubscribeGlucose) unsubscribeGlucose();
    };
  }, [currentDate, userId]);

  const { labels, caloriesData, glucoseData } = getMonthlyData(caloriesConsumed, glucoseOverall);

  return (
    <View style={styles.container}>
      {showDate && (
        <View style={styles.header}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() =>
              setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))
            }>
            <FontAwesome name="chevron-left" size={18} color="black" />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <FontAwesome name="calendar" size={16} color="black" />
            <Text style={styles.dateText}> {formattedCurrentDate} </Text>
          </View>

          <TouchableOpacity
            style={{ padding: 10 }}
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
        <Text style={styles.title}>Calories vs Glucose Corelations</Text>

        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: caloriesData,
                color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Blue
                strokeWidth: 3,
              },
              {
                data: glucoseData,
                color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`, // Purple
                strokeWidth: 3,
              },
            ],
          }}
          width={Dimensions.get('window').width * 0.85}
          height={200}
          yAxisInterval={1}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: () => '#333',
            style: { borderRadius: 10 },
            propsForDots: { r: '5', strokeWidth: '2', stroke: '#333' },
          }}
          bezier
          style={styles.chart}
        />

        <View style={styles.legendContainer}>
          <View style={[styles.legendDot, { backgroundColor: 'blue' }]} />
          <Text style={styles.legendText}>Calories (kcal)</Text>
          <View style={[styles.legendDot, { backgroundColor: 'purple' }]} />
          <Text style={styles.legendText}>Glucose (mmol/L)</Text>
        </View>
      </View>
    </View>
  );
};

export default CaloriesGlucoseCorrelationCard;

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 10,
  },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 16, fontWeight: '600' },
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
  title: { fontSize: 18, fontWeight: 'bold' },
  chart: { marginVertical: 10, borderRadius: 10 },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },
  legendText: { fontSize: 14, color: '#333' },
});
