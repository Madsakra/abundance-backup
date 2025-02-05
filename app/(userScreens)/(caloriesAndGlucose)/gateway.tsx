import { RelativePathString } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import GatewayCard from '~/components/GatewayCard';

const calorieLinks = {
  headerText: 'Calories Data',
  routeLists: [
    {
      image: require('assets/routeImages/calo_input.jpg'),
      routeRef: '/calories/cookedMeals' as RelativePathString,
      routeName: 'Food Logging',
    },
    {
      image: require('assets/routeImages/calo_output.jpg'),
      routeRef: '/calories/output/activityGateway' as RelativePathString,
      routeName: 'Calories Output Logging',
    },
    {
      image: require('assets/routeImages/chart_data.jpg'),
      routeRef: '/(caloriesAndGlucose)/calories/graph/calories-graph' as RelativePathString,
      routeName: 'View Graphed Data',
    },
  ],
};

const glucoseLinks = {
  headerText: 'Glucose Data',
  routeLists: [
    {
      image: require('assets/routeImages/glucose_log.jpg'),
      routeRef:
        '/(caloriesAndGlucose)/glucose/glucose-logging?glucoseLevel=0%20mmo%2FL' as RelativePathString,
      routeName: 'Glucose Logging',
    },
    {
      image: require('assets/routeImages/chart_data.jpg'),
      routeRef: '/(caloriesAndGlucose)/glucose/graph/glucose-graph' as RelativePathString,
      routeName: 'View Graphed Data',
    },
  ],
};

export default function GateWay() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Text style={styles.header}>Select your path for management</Text>
      <GatewayCard
        headerText={calorieLinks.headerText}
        iconName="flame"
        routeLists={calorieLinks.routeLists}
        themeColor="#C68F5E"
      />

      {/*GLUCOSE SECTION*/}
      <GatewayCard
        headerText={glucoseLinks.headerText}
        iconName="cube"
        routeLists={glucoseLinks.routeLists}
        themeColor="#DB8189"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginStart: 30,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#00ACAC',
  },
});
