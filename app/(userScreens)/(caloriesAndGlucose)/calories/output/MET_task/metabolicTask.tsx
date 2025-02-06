import { Entypo, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from '@react-native-firebase/auth';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useUserProfile } from '~/ctx';
import { CaloriesOutputTracking } from '~/types/common/calories';
import { currentUser, db, toastError, toastSuccess } from '~/utils';

export default function MetabolicTask() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id || '';
  const name = Array.isArray(params.name) ? params.name[0] : params.name || '';
  const metValue = parseFloat(Array.isArray(params.value) ? params.value[0] : params.value || '0');

  // Separate states for start and end time
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [caloriesBurnt, setCaloriesBurnt] = useState(0);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSettingStartTime, setIsSettingStartTime] = useState(true); // Track which time is being set
  const { profile } = useUserProfile();

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false); // Close the time picker
    if (selectedTime) {
      if (isSettingStartTime) {
        setStartTime(selectedTime);
      } else {
        setEndTime(selectedTime); // Update end time
      }
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12; // Convert 24-hour to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}.${formattedMinutes} ${ampm}`;
  };

  // Function to calculate duration in hours
  const calculateDuration = () => {
    const durationMs = endTime.getTime() - startTime.getTime();
    return Math.max(durationMs / (1000 * 60 * 60), 0); // Convert ms to hours, ensure non-negative
  };

  // Calculate calories burned
  const calculateCaloriesBurned = () => {
    const durationHours = calculateDuration();
    console.log(durationHours);
    setCaloriesBurnt(metValue * profile!.weight * durationHours);
  };

  // Trigger recalculation whenever startTime or endTime changes
  useEffect(() => {
    calculateCaloriesBurned();
  }, [startTime, endTime]);

  async function uploadCalories() {
    if (caloriesBurnt <= 0) {
      toastError('Calories burned must be greater than zero!');
      return;
    }
    const data: CaloriesOutputTracking = {
      amount: caloriesBurnt,
      category: 'activity',
      MET_task: {
        id,
        name,
        value: metValue,
      },

      timestamp: new Date(Date.now()),
      type: 'output',
    };

    try {
      await db
        .collection(`accounts/${getAuth().currentUser?.uid}/calories`)
        .add(data)
        .then(() => {
          toastSuccess('Uploaded Successfully');
          setTimeout(() => {
            router.push('/(userScreens)/(caloriesAndGlucose)/gateway');
          }, 1200);
        });
    } catch (err) {
      console.log(err);
      toastError('Something went wrong!');
    }
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text style={styles.header}>Calorie Output</Text>
      <Link
        href="/(userScreens)/(caloriesAndGlucose)/calories/output/MET_task/metabolicEqui"
        style={[styles.seperaterStyle, { alignSelf: 'flex-start' }]}>
        <Entypo name="chevron-thin-left" size={24} color="black" />
      </Link>

      <View style={[styles.dataBox]}>
        <Text style={{ fontSize: 18 }}>{name}</Text>
        <Text style={{ fontSize: 15, fontWeight: '300' }}>{metValue} Met</Text>
      </View>

      <View style={styles.calculatorBox}>
        {/* DISPLAY WEIGHT */}
        <Text style={styles.valueLabel}>Your Weight</Text>
        <View style={styles.valueBar}>
          <Text style={styles.valueText}>{profile?.weight} kg</Text>
        </View>

        {/* DISPLAY START TIME */}
        <Text style={styles.valueLabel}>Activity Start Time</Text>
        <View style={styles.valueBar}>
          <Pressable
            style={styles.dateTimeButton}
            onPress={() => {
              setIsSettingStartTime(true);
              setShowTimePicker(true);
            }}>
            <FontAwesome6 name="clock" size={18} color="white" />
            <Text style={styles.valueText}>{formatTime(startTime)}</Text>
          </Pressable>
        </View>

        {/* DISPLAY END TIME */}
        <Text style={styles.valueLabel}>Activity End Time</Text>
        <View style={styles.valueBar}>
          <Pressable
            style={styles.dateTimeButton}
            onPress={() => {
              setIsSettingStartTime(false);
              setShowTimePicker(true);
            }}>
            <FontAwesome6 name="clock" size={18} color="white" />
            <Text style={styles.valueText}>{formatTime(endTime)}</Text>
          </Pressable>
        </View>

        {/* Calories burnt */}

        <View style={[styles.valueBar, { paddingVertical: 30, borderRadius: 10, marginTop: 20 }]}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: 'white', fontSize: 18, marginVertical: 5 }}>
                Calories Output
              </Text>
              <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold' }}>
                {caloriesBurnt.toFixed(2)} k/cal
              </Text>
            </View>

            <FontAwesome name="fire" size={50} color="white" />
          </View>
        </View>

        {/* TIME PICKER MODAL */}
        {showTimePicker && (
          <DateTimePicker
            value={isSettingStartTime ? startTime : endTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>

      <Pressable style={styles.submitButton} onPress={uploadCalories}>
        <Text style={styles.submitText}>Log Output</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    fontSize: 15,
    fontWeight: 'bold',
    backgroundColor: '#C68F5E',
    color: 'white',
  },
  seperaterStyle: {
    marginHorizontal: 20,
    marginVertical: 25,
  },

  dataBox: {
    flexDirection: 'row',
    marginTop: 10,
    padding: 30,
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    borderRadius: 5,
    shadowOpacity: 0.2,
    shadowRadius: 5.62,
    elevation: 18,
    backgroundColor: 'white',
  },

  calculatorBox: {
    marginTop: 10,
    padding: 30,
    paddingTop: 5,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    borderRadius: 5,
    shadowOpacity: 0.2,
    shadowRadius: 5.62,
    elevation: 18,
    backgroundColor: 'white',
    marginBottom: 20,
  },

  valueLabel: {
    marginBottom: 5,
    marginTop: 20,
  },

  valueBar: {
    backgroundColor: '#C68F5E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 5,
  },

  valueText: {
    color: 'white',
  },

  dateTimeButton: {
    padding: 5,
    borderRadius: 5,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  submitButton: {
    marginVertical: 10,
    marginBottom: 30,
    alignSelf: 'center',
    width: '80%',
    paddingVertical: 15,
    borderRadius: 60,
    backgroundColor: '#C68F5E',
  },

  submitText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 15,
  },
});
