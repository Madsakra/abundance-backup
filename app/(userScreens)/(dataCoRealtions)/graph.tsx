import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import CaloriesGlucoseCorrelationCard from '~/components/cards/co-relations-graph-card';

export default function Graph() {
  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));
  return (
    <ScrollView
      style={{
        backgroundColor: 'white',
      }}>
      <CaloriesGlucoseCorrelationCard currentDate={currentDate} setCurrentDate={setCurrentDate} />
    </ScrollView>
  );
}
