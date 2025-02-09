/* eslint-disable react-hooks/rules-of-hooks */
import { AntDesign, Feather } from '@expo/vector-icons';
import { getAuth } from '@react-native-firebase/auth';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  aggregateRecord,
  getGrantedPermissions,
  initialize,
  openHealthConnectSettings,
} from 'react-native-health-connect';
import { Permission } from 'react-native-health-connect/lib/typescript/types';

import Databox from '~/components/Databox';
import LoadingAnimation from '~/components/LoadingAnimation';
import PermissionView from '~/components/PermissionView';
import { useUserProfile } from '~/ctx';
import { CaloriesOutputTracking } from '~/types/common/calories';
import { currentUser, db, toastError, toastSuccess } from '~/utils';

const getStartOfToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to 00:00:00
  return today;
};

const getTodayDate = (): Date => {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 59);
  return endOfToday;
};

export default function syncWithSteps() {
  const { profile } = useUserProfile();
  const [androidPermissions, setAndroidPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0); // in meters
  const [calories, setCalories] = useState(0);

  const initializeHealthConnect = async () => {
    if (Platform.OS !== 'android') {
    } else {
      const initialized = await initialize();
      if (!initialized) {
        console.log('failed to initialize');
      }
    }
  };

  const checkPermissions = async () => {
    const permissions = await getGrantedPermissions();
    setAndroidPermissions(permissions);
  };

  const reGrantPermission = async () => {
    const permissions = await getGrantedPermissions();
    if (permissions.length !== 4) {
      toastError('Please grant the necessary permissions for us to collect data!');
    }
    setAndroidPermissions(permissions);
  };

  const fetchTodayData = async () => {
    setLoading(true);
    try {
      const stepResult = await aggregateRecord({
        recordType: 'Steps',
        timeRangeFilter: {
          operator: 'between',
          startTime: getStartOfToday().toISOString(),
          endTime: getTodayDate().toISOString(),
        },
      });
      const distanceResult = await aggregateRecord({
        recordType: 'Distance',
        timeRangeFilter: {
          operator: 'between',
          startTime: getStartOfToday().toISOString(),
          endTime: getTodayDate().toISOString(),
        },
      });

      // count calories per step first
      // assume walking cal burnt
      const caloPerStep = profile!.weight * 0.0005;

      setCalories(caloPerStep * stepResult.COUNT_TOTAL);

      setSteps(stepResult.COUNT_TOTAL);
      setDistance(distanceResult.DISTANCE.inMeters);

      setInterval(() => {
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Error fetching today's data:", err);
    }
  };

  async function uploadCalories() {
    setLoading(true);
    if (!currentUser) return;
    if (calories <= 0) {
      toastError('Calories burned must be greater than zero!');
      return;
    }
    const data: CaloriesOutputTracking = {
      amount: calories,
      category: 'activity',
      StepTrack: {
        steps,
        distance,
        name: 'Steps',
      },
      timestamp: new Date(Date.now()),
      type: 'output',
    };

    try {
      await db
        .doc(`accounts/${getAuth().currentUser?.uid}/calories/steps`)
        .set(data)
        .then(() => {
          setLoading(false);
          toastSuccess('Uploaded Successfully');
          setTimeout(() => {
            router.push('/(userScreens)/(caloriesAndGlucose)/gateway');
          }, 2200);
        });
    } catch (err) {
      console.log(err);
      toastError('Something went wrong!');
    }
  }

  const resetSync = () => {
    setCalories(0);
    setDistance(0);
    setSteps(0);
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      setLoading(true);
      resetSync();
      initializeHealthConnect();
      checkPermissions();
      setLoading(false);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={{ color: 'white', fontWeight: '600' }}>Sync with steps</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {androidPermissions.length !== 5 ? (
          <PermissionView
            subTitle="Some permission is required for us to collect your health connect data."
            handleFunction={openHealthConnectSettings}
            buttonTitle="Grant Permission"
            image={require('assets/permission-img/health-connect.png')}
            themeColor="#C68F5E"
            subActionText="Check Permission"
            secondaryAction={reGrantPermission}
          />
        ) : (
          <View style={styles.container}>
            {loading ? (
              <LoadingAnimation />
            ) : (
              <View>
                <Pressable style={styles.settings} onPress={openHealthConnectSettings}>
                  <Feather name="settings" size={24} color="#C68F5E" />
                </Pressable>

                <Databox
                  iconName="footsteps-sharp"
                  subjectName="Steps"
                  value={steps}
                  unit="steps"
                />

                <Databox iconName="walk" subjectName="Distance" value={distance} unit="m" />

                <Databox
                  iconName="flame"
                  subjectName="Calories Burnt"
                  value={calories}
                  unit="k/cal"
                />

                {steps ? (
                  <Pressable
                    onPress={uploadCalories}
                    style={[styles.syncButton, { backgroundColor: '#C68F5E' }]}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                      Log Data
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={fetchTodayData} style={styles.syncButton}>
                    <AntDesign name="sync" size={50} color="#C68F5E" />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    fontSize: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#C68F5E',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
  },

  settings: {
    alignSelf: 'flex-end',
    margin: 20,
    marginBottom: 20,
  },

  syncButton: {
    borderRadius: 90,
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.62,
    elevation: 18,
  },

  submitButton: {
    padding: 20,
    paddingHorizontal: 40,
    width: '80%',
    marginTop: 50,
    alignSelf: 'center',
    borderRadius: 30,
    backgroundColor: '#C68F5E',
  },
});
