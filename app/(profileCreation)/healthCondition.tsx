import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox, RadioButton } from 'react-native-paper';

import FunctionTiedButton from '~/components/FunctionTiedButton';
import { HealthProfileData, SelectedHealthProfile } from '~/types/common/health-condition';
import { updateLocalProfileFields } from '~/utils';


export default function HealthCondition() {
  const [healthCondis, setHealthCondis] = useState<HealthProfileData[]>([]);
  const [profileHealthCondi, setProfileHealthCondi] = useState<SelectedHealthProfile[]>([]);

  const loadHealthConditions = async () => {
    try {
      const querySnapshot = await firestore().collection('health_conditions').get();

      const temp: HealthProfileData[] = querySnapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        name: documentSnapshot.data().name,
        variation:documentSnapshot.data().variation
      }));
      setHealthCondis(temp);
    } catch (error) {
      console.error('Error loading health conditions: ', error);
    }
  };

  useEffect(() => {
    loadHealthConditions();
  }, []);

  const toggleCondition = (condition: HealthProfileData) => {
    setProfileHealthCondi((prev) => {
      const exists = prev.some((condi) => condi.id === condition.id);
      return exists
        ? prev.filter((condi) => condi.id !== condition.id) // Remove if already selected
        : [...prev, { id: condition.id, name: condition.name, variation: '' }]; // Ensure name is included
    });
  };
  const selectVariation = (conditionId: string, variation: string) => {
    setProfileHealthCondi((prev) =>
      prev.map((condi) => (condi.id === conditionId ? { ...condi, variation } : condi))
    );
  };

  // load pre-existing data , so user don't have to restart
  const loadProfileData = async () => {
    const data = await AsyncStorage.getItem('profileData');
    if (data) {
      const profile = JSON.parse(data);
      setProfileHealthCondi([...profile.profileHealthCondi]);
    }
  };

  const nextSection = async () => {
    const incompleteConditions = profileHealthCondi.filter((condition) => !condition.variation);

    if (incompleteConditions.length > 0) {
      alert('Please select a variation for every selected health condition before proceeding.');
      return;
    }

    await updateLocalProfileFields({ profileHealthCondi });
    router.replace('/(profileCreation)/dietInfo');
  };


  useEffect(() => {
    loadProfileData();
  }, []);

  return (
    <ScrollView>
      <Link
        href="/(profileCreation)/bmrInformation"
        style={{ marginHorizontal: 20, marginVertical: 25 }}>
        <Entypo name="chevron-thin-left" size={24} color="black" />
      </Link>

      <Text style={styles.header}>Health Conditions</Text>
      <Text style={styles.subHeader}>
        Select your health condition below so that we can help you navigate from health risks
      </Text>
      <Image
        source={require('assets/profileCreation/health_condi.jpg')}
        style={{ width: 100, height: 100, alignSelf: 'center', marginBottom: 20 }}
      />

        {healthCondis.map((condition) => {
        const isSelected = profileHealthCondi.some((condi) => condi.id === condition.id);
        const selectedVariation = profileHealthCondi.find((condi) => condi.id === condition.id)?.variation || '';

        return (
          <View key={condition.id} style={{ marginBottom: 20 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                backgroundColor: isSelected ? '#ddd' : '#f8f8f8',
                borderRadius: 5
              }}
              onPress={() => toggleCondition(condition)}
            >
              <Checkbox status={isSelected ? 'checked' : 'unchecked'} />
              <Text style={{ fontSize: 16, marginLeft: 10 }}>{condition.name}</Text>
            </TouchableOpacity>

            {isSelected && condition.variation.length > 0 && (
              <View style={{ paddingLeft: 30, marginTop: 5 }}>
                {condition.variation.map((variant) => (
                  <TouchableOpacity key={variant} onPress={() => selectVariation(condition.id, variant)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                    <RadioButton.Android value={variant} status={selectedVariation === variant ? 'checked' : 'unchecked'} onPress={() => selectVariation(condition.id, variant)} />
                    <Text style={{ fontSize: 14, marginLeft: 10 }}>{variant}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}


      <FunctionTiedButton
        buttonStyle={styles.buttonBox}
        onPress={nextSection}
        textStyle={styles.buttonText}
        title="Next"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    textAlign: 'center',
  },

  subHeader: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#818181',
    paddingVertical: 10,
    paddingHorizontal: 40,
  },

  listContainer: {
    padding: 20,
  },

  tabBox: {
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    marginVertical: 5,
    flexWrap: 'wrap',
    marginBottom: 10,
  },

  tabTextStyle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'white',
  },

  listHeader: {
    marginLeft: 20,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },

  listWarning: {
    color: 'red',
    fontFamily: 'Poppins-SemiBold',
    paddingLeft: 30,
    fontSize: 15,
  },

  buttonBox: {
    backgroundColor: '#6B7FD6',
    borderRadius: 30,
    marginVertical: 20,
    width: '90%',
    alignSelf: 'center',
  },

  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'white',
    padding: 12,
    textAlign: 'center',
  },

  listBox: {
    height: 250,
    borderWidth: 1,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#D2D2D2',
  },
});
