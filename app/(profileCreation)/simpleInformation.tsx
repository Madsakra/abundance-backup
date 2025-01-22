import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import DatePicker from '~/components/DatePicker';
import FunctionTiedButton from '~/components/FunctionTiedButton';
import ImageSelector from '~/components/ImageSelector';
import InputContainer from '~/components/InputContainer';
import { updateLocalProfileFields } from '~/utils';

export default function SimpleInformation() {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // load pre-existing data , so user don't have to restart
  const loadProfileData = async () => {
    const data = await AsyncStorage.getItem('profileData');
    if (data) {
      const profile = JSON.parse(data);
      setImage(profile.image);
      setName(profile.name);
      setGender(profile.gender);
      setBirthDate(new Date(profile.birthDate));
    }
  };

  const nextSection = async () => {
    // SAVE THE IMAGE,NAME, GENDER AND DOB
    // IF SUCCEED, GO TO NEXT PAGE

    try {
      // IMAGE NOT TAKEN INTO CONSIDERATION FOR NOW --- SETTLE LATER
      if (image && name?.trim() !== '' && gender.trim() !== '' && birthDate) {
        await updateLocalProfileFields({
          image,
          name,
          gender,
          birthDate: birthDate ? birthDate.toISOString() : null, // Convert Date to ISO string for storage
        });
        router.replace('/(profileCreation)/bmrInformation');
      } else {
        alert('Please Fill Up the form correctly!');
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  return (
    <ScrollView style={styles.pageContainer}>
      <Text style={styles.header}>Profile Creation</Text>
      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 15, textAlign: 'center' }}>
        Let’s start by creating your profile
      </Text>

      {/* Image selector*/}
      <Text
        style={{ fontFamily: 'Poppins-Medium', fontSize: 12, textAlign: 'center', marginTop: 40 }}>
        Your Avatar
      </Text>
      <Pressable
        onPress={pickImage}
        style={
          image ? styles.imageContainer : [styles.imageContainer, { backgroundColor: 'gray' }]
        }>
        {image && <Image source={{ uri: image }} style={{ flex: 1, borderRadius: 50 }} />}

        <ImageSelector pickImage={pickImage} />
      </Pressable>
      {/*----------------*/}

      {/* FORM CONTAINER*/}
      <View style={styles.formsContainer}>
        {/* Name Input */}
        <InputContainer width="100%" inputLabel="Name">
          <TextInput
            placeholder="Enter your Name"
            value={name}
            onChangeText={(text) => setName(text)}
            style={[styles.inputBox]}
          />
        </InputContainer>

        {/* Gender Input */}

        <View
          style={{
            width: '100%',
            alignSelf: 'center',
            borderRadius: 30,
            backgroundColor: '#F0F0F0',
            paddingHorizontal: 10,
          }}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={{ padding: 5 }}>
            <Picker.Item label="Select Your Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        {/*Birthday input*/}
        <DatePicker birthDate={birthDate} setBirthDate={setBirthDate} />

        {/*Submit button*/}
        <FunctionTiedButton
          buttonStyle={styles.buttonBox}
          onPress={nextSection}
          textStyle={styles.buttonText}
          title="Next"
        />
      </View>
      {/* --------------FORM CONTAINER---------------*/}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    width: '100%',
    paddingVertical: 5,
    paddingStart: 0,
  },

  pageContainer: {
    flex: 1,
    padding: 20,
  },

  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    textAlign: 'center',
    marginTop: 15,
  },

  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    position: 'relative',
    marginTop: '5%',
  },

  formsContainer: {
    flex: 1,
    marginTop: 50,

    gap: 20,
  },

  // PICKER - TO BE TRANSFERRED TO COMPONENT

  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#505050',
    fontFamily: 'Poppins-Regular',
  },

  nameContainer: {
    borderWidth: 1,
    borderColor: '#8797DA',
    borderRadius: 5,
    overflow: 'hidden',
    padding: 15,
    height: 65,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },

  GenderInputContainer: {
    borderWidth: 1,
    borderColor: '#8797DA',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    color: '#505050',
    fontFamily: 'Poppins-Regular',
  },

  buttonBox: {
    backgroundColor: '#6B7FD6',
    borderRadius: 30,
    marginVertical: 10,
  },

  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'white',
    padding: 12,
    textAlign: 'center',
  },
});
