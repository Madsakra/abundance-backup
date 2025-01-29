import { FontAwesome } from '@expo/vector-icons'; // For calendar icon
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { CaloriesTracking } from '~/types/common/calories';

const CaloriesConsumedCard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [caloriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const [caloriesConsumed, setCaloriesConsumed] = useState<CaloriesTracking[]>([]);

  const user = auth().currentUser;
  const userId = user?.uid || '';

  const formatedCurrentDate = currentDate
    .toISOString()
    .split('T')[0]
    .split('-')
    .reverse()
    .join('/');

  async function fetchCaloriesConsumed(timestamp: Date) {
    const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
    const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59

    const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = firestore.Timestamp.fromDate(endOfDay);

    try {
      const documentSnapshot = await firestore()
        .collection('calories')
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

  async function fetchCaloriesConsumedOverall() {
    try {
      const documentSnapshot = await firestore()
        .collection('calories')
        .where('userID', '==', userId)
        .where('type', '==', 'input')
        .get();

      const calories = documentSnapshot.docs.map((doc) => doc.data() as CaloriesTracking);
      setCaloriesConsumed(calories);
    } catch (error) {
      console.error('Error fetching dietary restrictions: ', error);
    }
  }

  const getMonthlyCalories = (caloriesConsumed: CaloriesTracking[]) => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyCalories: { [key: string]: number } = {};

    // Initialize monthly data
    monthLabels.forEach((month) => (monthlyCalories[month] = 0));

    caloriesConsumed.forEach((entry) => {
      const date = entry.timestamp;
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);

      if (monthlyCalories[monthName] !== undefined) {
        monthlyCalories[monthName] += entry.amount || 0; // Sum calorie values
      }
    });

    return monthLabels.map((month) => monthlyCalories[month]);
  };

  const chartData = getMonthlyCalories(caloriesConsumed); // Process fetched data

  useEffect(() => {
    fetchCaloriesConsumed(currentDate);
    fetchCaloriesConsumedOverall();
  }, [currentDate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
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
          onPress={() => {
            if (
              currentDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
            ) {
              return;
            }
            setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
          }}>
          <FontAwesome name="chevron-right" size={18} color="black" />
        </TouchableOpacity>
      </View>

      {/* Card Content */}
      <View style={styles.card}>
        <Text style={styles.title}>Calories Consumed</Text>
        <Text style={styles.calories}>
          {caloriesConsumedToday.reduce((acc, curr) => acc + curr.amount, 0)} kcal
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

export default CaloriesConsumedCard;

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
