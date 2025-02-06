import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import AppleHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';
import { CustomAlert } from '~/components/alert-dialog/custom-alert-dialog';
import Toast from '~/components/notifications/toast';
import { CaloriesOutputTracking } from '~/types/common/calories';
import { colorBrown, toastRef, toastSuccess } from '~/utils';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.ActiveEnergyBurned],
    write: [],
  },
};

export default function StepsSyncIos() {
  const [hasPermission, setHasPermission] = useState(false);
  const [alert, setAlert] = useState(false);

  const router = useRouter();

  const fetchCaloriesBurned = async (): Promise<number> => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getActiveEnergyBurned(
        {
          startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
          endDate: new Date().toISOString(),
          includeManuallyAdded: true,
        },
        (err: Object, results: HealthValue[]) => {
          if (err) {
            console.error('Error fetching calories burned:', err);
            reject(err);
            return;
          }

          const totalCaloriesBurned = results.reduce((acc, item) => acc + (item.value || 0), 0);

          console.log('🔥 Calories Burned:', totalCaloriesBurned, 'kcal');
          resolve(totalCaloriesBurned);
        }
      );
    });
  };

  const uploadCaloriesToFirestore = async (caloriesBurned: number) => {
    if (!caloriesBurned || caloriesBurned <= 0) return;

    const dbRef = firestore().collection(`accounts/${getAuth().currentUser?.uid}/calories`);
    const timestamp = new Date();

    const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0));
    const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999));
    const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = firestore.Timestamp.fromDate(endOfDay);

    const data: CaloriesOutputTracking = {
      amount: caloriesBurned,
      category: 'activity',
      timestamp: firestore.Timestamp.fromDate(new Date()),
      type: 'output',
    };

    try {
      const snapshot = await dbRef
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .where('type', '==', 'output')
        .get();

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        await dbRef.doc(docId).update(data);
        toastSuccess('Successfully synced with Apple Health.');
        setTimeout(() => {
          router.push('/(userScreens)/(caloriesAndGlucose)/calories/graph/calories-graph');
        }, 1200);
        console.log("Updated today's calories output:", docId);
      } else {
        await dbRef.doc().set(data);
        toastSuccess('Successfully synced with Apple Health.');
        setTimeout(() => {
          router.push('/(userScreens)/(caloriesAndGlucose)/calories/graph/calories-graph');
        }, 1200);
        console.log('Stored new calories output in Firestore');
      }
    } catch (err) {
      console.error('Error storing calories output:', err);
    }
  };
  const syncData = async () => {
    try {
      const caloriesBurned = await fetchCaloriesBurned();
      await uploadCaloriesToFirestore(caloriesBurned);
    } catch (error) {
      console.error('Error syncing Apple Health data:', error);
    }
  };

  useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, (err) => {
      if (err) {
        console.log('Error: ', err);
        return;
      }

      setHasPermission(true);
    });
  }, []);

  useEffect(() => {
    if (!hasPermission) return;
  }, [hasPermission]);

  return (
    <View
      style={{
        paddingTop: 20,
        backgroundColor: 'white',
        height: '100%',
      }}>
      <Toast ref={toastRef} />
      <CustomAlert
        visible={alert}
        title="Apple Health Permission"
        message="You can grant permissions in app settings under Apps and go to Health, Data Access & Devices and Abundacne App."
        onClose={() => setAlert(false)}
        onConfirm={() => setAlert(false)}
      />
      <Text
        style={{
          backgroundColor: colorBrown,
          padding: 20,
          color: 'white',
          fontSize: 20,
          fontWeight: 'bold',
        }}>
        Sync with Apple Health
      </Text>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: hasPermission ? '60%' : '80%',
        }}>
        <Image
          style={{
            width: 200,
            height: 200,
          }}
          source={require('assets/permission-img/health-connect.png')}
        />
        {hasPermission ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
            }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
              }}>
              Have Permission.
            </Text>
            <Pressable
              style={{
                padding: 20,
                borderRadius: 30,
                backgroundColor: colorBrown,
                paddingHorizontal: 60,
              }}
              onPress={syncData}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Sync Data</Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
            }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
              }}>
              Require Permission
            </Text>
            <Text
              style={{
                paddingHorizontal: 30,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '400',
              }}>
              Some permission is required for us to collect your health data.
            </Text>
            <Pressable
              style={{
                marginTop: 50,
                padding: 20,
                borderRadius: 30,
                backgroundColor: colorBrown,
                paddingHorizontal: 30,
              }}
              onPress={() => setAlert(true)}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                Grant Permission
              </Text>
            </Pressable>

            <Pressable
              style={{
                paddingHorizontal: 40,
                borderRadius: 30,
              }}
              onPress={() =>
                router.navigate(
                  '/(userScreens)/(caloriesAndGlucose)/calories/output/activityGateway'
                )
              }>
              <Text style={{ color: colorBrown, fontWeight: 'bold', fontSize: 18 }}>Not Now</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
