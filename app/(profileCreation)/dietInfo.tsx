import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import FunctionTiedButton from '~/components/FunctionTiedButton';
import PressableTab from '~/components/PressableTab';
import { updateLocalProfileFields } from '~/utils';

type Diet = {
  id: string;
  name: string;
};

export default function DietInfo() {
  const [allDiets, setAllDiets] = useState<Diet[]>();

  const [profileDiet, setProfileDiet] = useState<Diet[]>([]);

  // CALL DB
  const loadAllDiets = async () => {
    try {
      const querySnapshot = await firestore().collection('dietary_restrictions').get();

      const temp: Diet[] = querySnapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        name: documentSnapshot.data().name,
      }));
      setAllDiets(temp);
    } catch (error) {
      console.error('Error loading health conditions: ', error);
    }
  };

  const handleDiet = (newDiet: Diet) => {
    // set health condi if selected, unselect if tapped again
    // also make sure no double entries
    setProfileDiet((prevState) => {
      // Check if the condition is already selected
      const exists = prevState.some((oldDiet) => oldDiet.id === newDiet.id);

      if (exists) {
        // If it exists, remove it (deselect)
        return prevState.filter((oldDiet) => oldDiet.id !== newDiet.id);
      } else {
        // If it doesn't exist, add it (select)
        return [...prevState, newDiet];
      }
    });
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

      {/*Dietary restriction section*/}
      <View style={styles.listBox}>
        <FlashList
          data={allDiets}
          extraData={profileDiet}
          renderItem={({ item }) => (
            <PressableTab
              editable
              isPressed={profileDiet.some(
                (condition) => condition.id === item.id // Ensure you're comparing by id
              )}
              tabBoxStyle={styles.tabBox}
              handleInfo={handleDiet}
              tabTextStyle={styles.tabTextStyle}
              tabValue={item}
            />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContainer}
        />
      </View>

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
