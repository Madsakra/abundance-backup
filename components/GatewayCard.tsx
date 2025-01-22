import { Ionicons } from '@expo/vector-icons';
import { Link, RelativePathString } from 'expo-router';
import React, { ComponentProps } from 'react';
import { Image, ImageProps, StyleSheet, Text, View } from 'react-native';

import FoodLogLink from './FoodLogLink';

interface route {
  image: ImageProps;
  routeRef: RelativePathString;
  routeName: string;
}

type GatewayCardProps = {
  headerText: string;
  iconName?: ComponentProps<typeof Ionicons>['name'];
  routeLists: route[];
  themeColor: string;
};

export default function GatewayCard({
  headerText,
  iconName,
  routeLists,
  themeColor,
}: GatewayCardProps) {
  return (
    <View style={styles.outerContainer}>
      <View style={[styles.innerContainer, { gap: 5 }]}>
        {/*First row*/}
        <View style={[styles.row, { gap: 20 }]}>
          <View style={styles.headerCircle}>
            <Ionicons name={iconName} size={24} color={themeColor} />
          </View>

          <Text style={{ fontFamily: 'Poppins-Medium', color: themeColor }}>{headerText}</Text>
        </View>

        {/*Subsequent row*/}
        {routeLists.map((route, index) => {
          return route.routeName === 'Food Logging' ? (
            <FoodLogLink
              key={index}
              index={index}
              image={route.image}
              routeName={route.routeName}
            />
          ) : (
            <Link
              href={route.routeRef}
              key={index}
              style={{ padding: 15, backgroundColor: '#f9f9f9', borderRadius: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <Image source={route.image} style={{ width: 50, height: 50 }} />
                <Text style={{ fontFamily: 'Poppins-Regular' }}>{route.routeName}</Text>
              </View>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerContainer: {
    backgroundColor: 'white',
    width: '100%',
    height: 'auto',
    padding: 5,
    borderRadius: 20,
  },

  row: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },

  headerCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
});
