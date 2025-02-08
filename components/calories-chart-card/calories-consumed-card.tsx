import { FontAwesome } from '@expo/vector-icons'; // For calendar icon
import auth from '@react-native-firebase/auth';
import { Timestamp } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { fetchCaloriesConsumed, fetchCaloriesConsumedOverall } from '~/actions/actions';
import { CaloriesTracking } from '~/types/common/calories';

type CaloriesConsumedCardProps = {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  netCaloriesConsumed: number;
  showDate?: boolean;
  showNetCalories?: boolean;
};

const CaloriesConsumedCard = ({
  currentDate,
  setCurrentDate,
  netCaloriesConsumed,
  showDate = true,
  showNetCalories = true,
}: CaloriesConsumedCardProps) => {
  // const [currentDate, setCurrentDate] = useState(new Date());
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

  const getMonthlyCalories = (caloriesConsumed: CaloriesTracking[]) => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyCalories: { [key: string]: number } = {};

    monthLabels.forEach((month) => (monthlyCalories[month] = 0));

    caloriesConsumed.forEach((entry) => {
      let date: Date;

      if (entry.timestamp instanceof Timestamp) {
        date = entry.timestamp.toDate();
      } else if (typeof entry.timestamp === 'object' && 'seconds' in entry.timestamp) {
        date = new Date(entry.timestamp.seconds * 1000);
      } else {
        date = new Date(entry.timestamp);
      }

      if (!isNaN(date.getTime())) {
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);

        if (monthlyCalories[monthName] !== undefined) {
          monthlyCalories[monthName] += entry.amount || 0;
        }
      } else {
        console.warn('Invalid date format:', entry.timestamp);
      }
    });

    return monthLabels.map((month) => monthlyCalories[month]);
  };

  const chartData = getMonthlyCalories(caloriesConsumed);

  useEffect(() => {
    let unsubscribeConsumedToday: () => void;
    let unsubscribeConsumedOverall: () => void;

    (async () => {
      unsubscribeConsumedToday = await fetchCaloriesConsumed(
        currentDate,
        userId,
        setCaloriesConsumedToday
      );
      unsubscribeConsumedOverall = await fetchCaloriesConsumedOverall(userId, setCaloriesConsumed);
    })();

    return () => {
      if (unsubscribeConsumedToday) unsubscribeConsumedToday();
      if (unsubscribeConsumedOverall) unsubscribeConsumedOverall();
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
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <View>
            <Text style={styles.title}>Calories Consumed</Text>
            <Text style={styles.calories}>
              {Math.round(caloriesConsumedToday.reduce((acc, curr) => acc + curr.amount, 0) * 100) /
                100}{' '}
              kcal
            </Text>
          </View>
          {showNetCalories && (
            <View>
              <Text
                style={{
                  color: 'gray',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                Net Calories
              </Text>
              <Text
                style={{
                  ...styles.orders,
                  color: netCaloriesConsumed > 0 ? '#1565C0' : '#FF5722', // Change color based on net calories
                  fontWeight: 'bold',
                }}>
                {Math.round(netCaloriesConsumed * 100) / 100} kcal
              </Text>
            </View>
          )}
        </View>

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
