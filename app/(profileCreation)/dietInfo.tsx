import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox, RadioButton } from 'react-native-paper';
import FunctionTiedButton from '~/components/FunctionTiedButton';

import { HealthProfileData, SelectedHealthProfile } from '~/types/common/health-condition';
import { updateLocalProfileFields } from '~/utils';



export default function DietInfo() {
  const [allDiets, setAllDiets] = useState<HealthProfileData[]>([]);
  const [profileDiet, setProfileDiet] = useState<SelectedHealthProfile[]>([]);

  // CALL DB
  const loadAllDiets = async () => {
    try {
      const querySnapshot = await firestore().collection('dietary_restrictions').get();

      const temp: HealthProfileData[] = querySnapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        name: documentSnapshot.data().name,
        variation:documentSnapshot.data().variation
      }));
         // Sort to ensure primary diets appear first
        const sortedDiets = temp.sort((a, b) => {
          // Consider 'primary' to be the primary diet
          if (a.name === 'primary diet' && b.name !== 'primary diet') return -1;
          if (b.name === 'primary diet' && a.name !== 'primary diet') return 1;
          return 0;
        });
     
    setAllDiets(sortedDiets);
    
    } catch (error) {
      console.error('Error loading health conditions: ', error);
    }
  };

  // Toggle function
  const toggleCondition = (item: HealthProfileData) => {

 
      // For other conditions, only one selection allowed
      setProfileDiet((prev) => {
        const exists = prev.some((diet) => diet.id === item.id);
        if (exists) {
          // Unselect the item (unselect variation for primary diets)
          return prev.filter((diet) => diet.id !== item.id);
        } else {
          // Add the selected condition (with default variation)
          return [...prev, { id: item.id, name: item.name, variation: '' }];
        }
    
    
  })};


  const selectVariation = (conditionId: string, variation: string) => {
    setProfileDiet((prev) =>
      prev.map((condi) => (condi.id === conditionId ? { ...condi, variation } : condi))
    );
  };

  // load pre-existing data , so user don't have to restart
  const loadProfileData = async () => {
    const data = await AsyncStorage.getItem('profileData');

    if (data) {
      const profile = JSON.parse(data);
      setProfileDiet([...profile.profileDiet]);
    }
  };

  const nextSection = async () => {
    const hasPrimaryDiet = profileDiet.some((diet) => diet.name === 'Primary diet');

    if (!hasPrimaryDiet) {
      // Show a warning or alert if no primary diet is selected
      alert('Please select at least one primary diet.');
      return; // Prevent submitting
    }
    // SEND DATA TO SQL LITE FIRST
    await updateLocalProfileFields({
      profileDiet,
    });
    // NAVIGATE TO GOAL SETTING PAGE
    router.replace('/(profileCreation)/goalSetting');
  };

  useEffect(() => {
    loadAllDiets();
    loadProfileData();
  }, []);



  return (
    <ScrollView>
      <Link
        href="/(profileCreation)/healthCondition"
        style={{ marginHorizontal: 20, marginVertical: 25 }}>
        <Entypo name="chevron-thin-left" size={24} color="black" />
      </Link>

      <Text style={styles.header}>Dietary Restrictions</Text>
      <Text style={styles.subHeader}>
        Let us know your dietary restrictions so that our nutritionist can prepare meal plans
        appropriately
      </Text>
      <Image
        source={require('assets/profileCreation/diet_restric.jpg')}
        style={{ width: 100, height: 100, alignSelf: 'center', marginVertical: 20 }}
      />

      {allDiets.map((item) => {
      const isSelected = profileDiet.some((diet) => diet.id === item.id);
      const selectedVariation = profileDiet.find((diet) => diet.id === item.id)?.variation || '';

        return (
          <View key={item.id} style={{ marginBottom: 20 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                backgroundColor: isSelected ? '#ddd' : '#f8f8f8',
                borderRadius: 5
              }}
              onPress={() => toggleCondition(item)}
            >
              <Checkbox status={isSelected ? 'checked' : 'unchecked'} />
              <Text style={{ fontSize: 16, marginLeft: 10 }}>{item.name}</Text>
            </TouchableOpacity>

            {isSelected && item.variation.length > 0 && (
              <View style={{ paddingLeft: 30, marginTop: 5 }}>
                {item.variation.map((variant) => (
                  <TouchableOpacity key={variant} onPress={() => selectVariation(item.id, variant)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                    <RadioButton.Android value={variant} status={selectedVariation === variant ? 'checked' : 'unchecked'} onPress={() => selectVariation(item.id, variant)} />
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
    fontSize: 28,
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
