import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { colorViolet } from '~/utils';

type ProgressBarProps = {
  currentValue: number;
  goalValue: number;
  title: string;
  iconName: string;
  color?: string;
};

const BMIProgressBar: React.FC<ProgressBarProps> = ({
  currentValue,
  goalValue,
  title,
  iconName,
  color = colorViolet,
}) => {
  const progress = Math.min(currentValue / goalValue, 1);

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          <Text style={styles.boldText}>
            {title} {goalValue}
          </Text>
          <FontAwesome5 name={iconName} size={16} color="black" />
        </Text>
      </View>

      <Text style={styles.bmiText}>
        {currentValue} / {goalValue}
      </Text>

      <ProgressBar progress={progress} color={color} style={styles.progressBar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  bmiText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default BMIProgressBar;
