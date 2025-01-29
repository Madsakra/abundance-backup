import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import DatePicker from '~/components/DatePicker';
import ImageSelector from '~/components/ImageSelector';
import LoadingAnimation from '~/components/LoadingAnimation';
import { CustomAlert } from '~/components/alert-dialog/custom-alert-dialog';
import { useUserAccount, useUserProfile } from '~/ctx';
import { UserProfile } from '~/types/users/profile';
import { capitalizeFirstLetter, colorViolet } from '~/utils';

export default function EditProfile() {
  const { profile, loading, setProfile } = useUserProfile();
  const { account } = useUserAccount();
  const [image, setImage] = useState<string | null>(profile?.image || null);
  const [name, setName] = useState<string>(account?.name || '');
  const [gender, setGender] = useState<string>(profile?.gender || '');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const router = useRouter();
  const user = auth().currentUser;
  const uid = user ? user.uid : null;

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    setImage(result.assets[0].uri);
  };

  const updateProfileInformations = async (updateData: Partial<UserProfile>) => {
    let imageUrl = null;
    if (updateData.image) {
      const reference = storage().ref(`${uid}-profile-picture`);
      await reference.putFile(updateData.image);
      imageUrl = await reference.getDownloadURL();
    }

    try {
      await firestore()
        .collection('profiles')
        .doc(user?.uid)
        .update({
          image: imageUrl || profile?.image,
          ...updateData,
        });
      await firestore().collection('accounts').doc(user?.uid).update({ name });

      console.log('Document successfully updated!');
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleClose = () => {
    setIsAlertVisible(false);
  };

  const handleConfirm = () => {
    updateProfileInformations({
      image: image || profile?.image,
      gender,
      birthDate: birthDate?.toISOString() || profile?.birthDate,
    });

    if (profile) {
      setProfile({
        ...profile,
        image: image || profile?.image,
        gender,
        birthDate: birthDate?.toISOString() || profile?.birthDate,
      });
    }

    router.push('/(userScreens)/(settings)/settings');

    setIsAlertVisible(false);
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <View
      style={{
        backgroundColor: 'white',
        height: '100%',
      }}>
      <CustomAlert
        visible={isAlertVisible}
        title="Edit Personal Informations?"
        message="Are you sure you want to save the changes?"
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          marginTop: 50,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 28,
            fontWeight: 'bold',
          }}>
          Edit Profile
        </Text>
        <Pressable
          onPress={pickImage}
          style={
            image ? styles.imageContainer : [styles.imageContainer, { backgroundColor: 'gray' }]
          }>
          {image && <Image source={{ uri: image }} style={{ flex: 1, borderRadius: 50 }} />}

          <ImageSelector pickImage={pickImage} />
        </Pressable>
        <View
          style={{
            gap: 10,
            width: '100%',
            paddingHorizontal: 50,
          }}>
          <View
            style={{
              backgroundColor: '#F0F0F0',
              paddingVertical: 10,
              paddingHorizontal: 25,
              width: '100%',
              borderRadius: 50,
            }}>
            <Text style={{ fontFamily: 'Poppins-Medium', marginBottom: 10 }}>Name</Text>
            <TextInput
              placeholder="Enter your name here..."
              value={name}
              onChangeText={(text) => setName(text)}
              style={{
                width: '100%',
              }}
            />
          </View>
        </View>
        <View
          style={{
            gap: 10,
            width: '100%',
            paddingHorizontal: 50,
            zIndex: 1000,
          }}>
          <View
            style={{
              backgroundColor: '#F0F0F0',
              paddingVertical: 10,
              paddingHorizontal: 25,
              width: '100%',
              borderRadius: 50,
            }}>
            <Text style={{ fontFamily: 'Poppins-Medium', marginBottom: 10 }}>Gender</Text>
            <Pressable onPress={() => setPickerVisible(!pickerVisible)}>
              <Text style={{ fontFamily: 'Poppins-Medium', color: 'gray' }}>
                {!pickerVisible && capitalizeFirstLetter(gender)}
              </Text>
            </Pressable>

            {pickerVisible && (
              <View
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  borderRadius: 30,
                  backgroundColor: '#F0F0F0',
                  paddingHorizontal: 10,
                  position: 'absolute',
                  zIndex: 1000,
                }}>
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => {
                    setGender(itemValue);
                    setPickerVisible(false);
                  }}
                  style={{ padding: 5 }}>
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            gap: 10,
            width: '100%',
            paddingHorizontal: 50,
            zIndex: 100,
          }}>
          <DatePicker birthDate={birthDate} setBirthDate={setBirthDate} />
        </View>

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            marginTop: 'auto',
          }}>
          <Pressable
            onPress={() => router.push('/(userScreens)/(settings)/settings')}
            style={{
              backgroundColor: 'gray',
              paddingVertical: 10,
              paddingHorizontal: 25,
              width: 150,
              borderRadius: 50,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                color: 'white',
              }}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setIsAlertVisible(true);
            }}
            style={{
              backgroundColor: colorViolet,
              paddingVertical: 10,
              paddingHorizontal: 25,
              width: 150,
              borderRadius: 50,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                color: 'white',
              }}>
              Save
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    position: 'relative',
    marginTop: '5%',
    backgroundColor: 'gray',
  },
});
