import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { CustomDropdownGlucoseUnit } from '~/components/dropdown/custom-dropdown-glucose-unit';
import Toast from '~/components/notifications/toast';
import { useUserAccount } from '~/ctx';
import { GlucoseUnit } from '~/types/common/glucose';
import {
  colorPink,
  formatDate,
  formatTime,
  toastError,
  toastInfo,
  toastRef,
  toastSuccess,
} from '~/utils';

export default function GlucoseLogging() {
  const { glucoseLevel } = useLocalSearchParams();

  if (typeof glucoseLevel !== 'string') {
    throw new Error('Invalid glucose level');
  }
  
  const glucoseLevelReading = glucoseLevel.split(' ')[0];
  const glucoseLevelUnit = glucoseLevel.split(' ')[1];

  const [glucoseUint, setGlucoseUint] = useState<GlucoseUnit>(
    glucoseLevelUnit as GlucoseUnit | 'mmol/L'
  );
  const [glucoseReading, setGlucoseReading] = useState<string>(glucoseLevelReading as string | '');
  const { membershipTier } = useUserAccount();

  const currentDate = new Date(Date.now());
  const user = auth().currentUser;
  const router = useRouter();

  const saveGlucoseReading = async () => {
    if (glucoseReading === '') {
      toastError('Please enter a glucose reading');
      return;
    }

    if (
      parseFloat(glucoseReading) < 0 ||
      parseFloat(glucoseReading) > 100 ||
      isNaN(parseFloat(glucoseReading))
    ) {
      toastError('Please enter a valid glucose reading');
      return;
    }

    try {
      await firestore()
        .collection(`accounts/${user?.uid}/glucose-logs`)
        .add({
          reading: parseFloat(glucoseReading),
          unit: glucoseUint,
          timestamp: currentDate,
        })
        .then(() => {
          toastSuccess('Uploaded Successfully');
          setTimeout(() => {
            router.push('/(userScreens)/(caloriesAndGlucose)/glucose/graph/glucose-graph');
          }, 1200);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      style={{
        height: '100%',
        backgroundColor: colorPink,
        padding: 20,
      }}>
      <Toast ref={toastRef} />
      <Text
        style={{
          color: 'white',
          fontSize: 24,
          fontFamily: 'Poppins-Bold',
          fontWeight: 'bold',
        }}>
        Glucose Logging
      </Text>
          {/*BACK BUTTON*/}
        <View style={{padding:10,paddingBottom:0,flexDirection:"row",alignItems:"center"}}>
        <Pressable onPress={()=>router.navigate("/(userScreens)/(caloriesAndGlucose)/gateway")}>
        <Entypo name="chevron-left" size={25} color="white" />
        </Pressable>

        <Pressable
        onPress={() => {
          if (membershipTier?.status!=="active") {
            toastInfo('Upgrade to premium to use this feature.');
            return;
          }
          router.push('/(userScreens)/(caloriesAndGlucose)/glucose/camera/camera-logging');
        }}
        style={{
          padding: 10,
          backgroundColor: 'white',
          width: 'auto',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginVertical: 20,
          marginLeft: 'auto',
        }}>
        <Ionicons name="camera" size={25} color={colorPink} />
        <Text
          style={{
            color: colorPink,
            fontWeight: 'bold',
          }}>
          Camera Logging
        </Text>
      </Pressable>


        </View>

      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
        }}>
        <Text
          style={{
            color: 'gray',
            fontSize: 24,
            fontWeight: 'bold',
          }}>
          Add Reading
        </Text>
        <View
          style={{
            backgroundColor: '#F0F0F0',
            paddingVertical: 10,
            paddingHorizontal: 25,
            width: '100%',
            borderRadius: 10,
            marginVertical: 20,
          }}>
          <Text
            style={{ fontFamily: 'Poppins-Medium', marginBottom: 10, fontSize: 16, color: 'gray' }}>
            Reading
          </Text>
          <TextInput
            placeholder="8.0 mmol/L"
            keyboardType="numeric"
            value={glucoseReading?.toString()}
            onChangeText={(text) => {
              setGlucoseReading(text);
            }}
            style={{
              width: '100%',
              color: colorPink,
              fontSize: 20,
            }}
          />
        </View>
        <CustomDropdownGlucoseUnit setSelectedUnit={setGlucoseUint} selectedUnit={glucoseUint} />
        <View
          style={{
            backgroundColor: '#F0F0F0',
            paddingVertical: 10,
            paddingHorizontal: 25,
            width: '100%',
            borderRadius: 10,
            marginVertical: 20,
          }}>
          <Text
            style={{ fontFamily: 'Poppins-Medium', marginBottom: 10, fontSize: 16, color: 'gray' }}>
            Date
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <AntDesign name="clockcircleo" size={20} color="black" />
            <Text
              style={{
                fontSize: 16,
                marginLeft: 10,
              }}>
              {formatDate(currentDate)}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: '#F0F0F0',
            paddingVertical: 10,
            paddingHorizontal: 25,
            width: '100%',
            borderRadius: 10,
          }}>
          <Text
            style={{ fontFamily: 'Poppins-Medium', marginBottom: 10, fontSize: 16, color: 'gray' }}>
            Time
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <AntDesign name="clockcircleo" size={20} color="black" />
            <Text
              style={{
                fontSize: 16,
                marginLeft: 10,
              }}>
              {formatTime(currentDate)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={saveGlucoseReading}
          style={{
            backgroundColor: colorPink,
            paddingVertical: 15,
            paddingHorizontal: 25,
            width: '100%',
            borderRadius: 50,
            marginTop: 20,
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontSize: 18,
              fontFamily: 'Poppins',
              fontWeight: 'bold',
            }}>
            Log Information
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
