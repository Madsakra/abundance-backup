import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import FunctionTiedButton from '~/components/FunctionTiedButton';
import InputContainer from '~/components/InputContainer';
import { updateLocalProfileFields } from '~/utils';

export default function BMRInformation() {
  const [height, setHeight] = useState<string | null>(null);
  const [weight, setWeight] = useState<string | null>(null);

  // load pre-existing data , so user don't have to restart
  const loadProfileData = async () => {
    const data = await AsyncStorage.getItem('profileData');
    if (data) {
      const profile = JSON.parse(data);

      setHeight(profile.height);
      setWeight(profile.weight);
    }
  };

  const nextSection = async () => {
    try {
      // Check if height and weight are valid (not null and not 0)
      if (height && weight && Number(height) > 0 && Number(weight) > 0) {
        // Proceed to the next section
        // MAKE CALL TO SQL LITE TO SAVE DATA
        await updateLocalProfileFields({
          height,
          weight,
        });

        router.replace('/(profileCreation)/healthCondition');
      } else {
        // Alert user if height or weight is invalid
        alert('Please fill in both height and weight correctly! Values must be greater than 0.');
      }
    } catch (err) {
      console.error('Error saving data or navigating:', err);
      alert('Something went wrong. Please try again!');
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Link href="/(profileCreation)/simpleInformation" style={{ padding: 25, paddingBottom: 0 }}>
        <Entypo name="chevron-thin-left" size={24} color="black" />
      </Link>

      <View style={styles.headerContainer}>
        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 32, textAlign: 'center' }}>
          BMR Information
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
            textAlign: 'center',
            color: '#818181',
          }}>
          This is for insulin prediction purposes
        </Text>
      </View>

      {/*Form Container*/}
      <View style={{ flex: 1, padding: 20, gap: 30, alignItems: 'center' }}>
        <Image
          source={require('assets/profileCreation/BMR.jpg')}
          style={{ width: 100, height: 100 }}
        />
        {/* Height Input */}
        <InputContainer width="100%" inputLabel="Height">
          <TextInput
            placeholder="Enter your Height (cm)"
            value={height ?? ''} // Use empty string if height is null
            onChangeText={(text) => setHeight(text || null)} // Set to null if text is empty
            style={styles.inputBox}
            inputMode="numeric"
          />
        </InputContainer>

        {/* Height Input */}
        <InputContainer width="100%" inputLabel="Weight">
          <TextInput
            placeholder="Enter your Weight (kg)"
            value={weight ?? ''} // Use empty string if height is null
            onChangeText={(text) => setWeight(text || null)} // Set to null if text is empty
            style={styles.inputBox}
            inputMode="numeric"
          />
        </InputContainer>

        {/*Submit button*/}

        <FunctionTiedButton
          buttonStyle={styles.buttonBox}
          onPress={nextSection}
          textStyle={styles.buttonText}
          title="Next"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 30,
    paddingTop: 50,
  },
  inputBox: {
    width: '100%',
    paddingVertical: 5,
    paddingStart: 0,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#505050',
    fontFamily: 'Poppins-Regular',
  },

  inputContainer: {
    borderWidth: 1,
    borderColor: '#8797DA',
    borderRadius: 5,
    overflow: 'hidden',
    padding: 15,
    height: 65,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  buttonBox: {
    backgroundColor: '#6B7FD6',
    borderRadius: 30,
    marginVertical: 10,
    width: '100%',
  },

  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'white',
    padding: 12,
    textAlign: 'center',
  },
});
