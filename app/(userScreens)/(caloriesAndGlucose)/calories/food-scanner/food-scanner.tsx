import { Entypo } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { SafeAreaView, StatusBar, View, StyleSheet, Platform, Text } from 'react-native';

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
        <Link
          style={{
            fontWeight: 'bold',
          }}
          href="/(userScreens)/(caloriesAndGlucose)/calories/cookedMeals">
          <Entypo name="chevron-left" size={30} color="black" />
        </Link>
        <Text style={{ fontSize: 20 }}>Food Scanner</Text>
      </View>
      <View style={styles.cameraContainer}>
        <CameraTesting />
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
