import { Entypo } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { SafeAreaView, StatusBar, View, StyleSheet, Platform, Text, Pressable } from 'react-native';

import CameraTesting from '~/app/camera-testing';

export default function FoodScanner() {
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'lightgrey',
        }}>
        <Pressable
         onPress={()=>{
          router.push({
            pathname: '/(userScreens)/(caloriesAndGlucose)/glucose/glucose-logging',
            params: { glucoseLevel: '0 mmol/L' }, // Pass the glucose level correctly
          });
         }}
          >
          <Entypo name="chevron-left" size={30} color="black" />
        </Pressable>
        <Text style={{ fontSize: 20 }}>Glucose Scanner</Text>
      </View>
      <View style={styles.cameraContainer}>
        <CameraTesting glucoseOrCalories="glucose" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  cameraContainer: {
    flex: 1,
  },
});
