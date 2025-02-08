import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from '@react-native-firebase/storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BackButton from '~/components/BackButton';
import DatePicker from '~/components/DatePicker';
import ImageSelector from '~/components/ImageSelector';
import LoadingAnimation from '~/components/LoadingAnimation';
import { CustomAlert } from '~/components/alert-dialog/custom-alert-dialog';
import { useUserAccount, useUserProfile } from '~/ctx';
import { UserProfile } from '~/types/users/profile';
import { capitalizeFirstLetter, colorViolet } from '~/utils';

export default function EditProfile() {
  const { profile, loading, setProfile } = useUserProfile();
  const { account, setAccount } = useUserAccount();
  const [image, setImage] = useState<string | null>(profile?.image || null);
  const [name, setName] = useState<string>(account?.name || '');
  const [gender, setGender] = useState<string>(profile?.gender || '');
  const [birthDate, setBirthDate] = useState<Date | null>(
    profile?.birthDate ? new Date(profile.birthDate) : null
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [internalLoad, setInternalLoad] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
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

  // age validation
  const isAgeAbove12 = (date: Date): boolean => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if the birth date hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age > 12;
  };

  const updateProfileInformations = async (updateData: Partial<UserProfile>): Promise<boolean> => {
    if (!name.trim()) {
      alert('Name cannot be empty');
      return false;
    }

    if (!birthDate || !isAgeAbove12(birthDate)) {
      alert('You must be older than 12 years old');
      return false;
    }

    let imageUrl = image || profile?.image;

    try {
      if (image && image !== profile?.image) {
        const storage = getStorage();
        const imageRef = ref(storage, `${uid}-profile-picture`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytesResumable(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Compare new values with existing ones
      const updatedData: Partial<UserProfile> = {};
      if (imageUrl !== profile?.image) updatedData.image = imageUrl;
      if (updateData.gender !== profile?.gender) updatedData.gender = updateData.gender;
      if (updateData.birthDate !== profile?.birthDate) updatedData.birthDate = updateData.birthDate;

      if (Object.keys(updatedData).length === 0 && name === account?.name) {
        return false; // No updates detected
      }

      await firestore()
        .collection('accounts')
        .doc(user?.uid)
        .collection('profile')
        .doc('profile_info')
        .update(updatedData);

      await firestore().collection('accounts').doc(user?.uid).update({ name });

      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  };

  const handleClose = () => {
    setIsAlertVisible(false);
  };

  const handleConfirm = async () => {
    setInternalLoad(true);
    const result = await updateProfileInformations({
      image: image || profile?.image,
      gender,
      birthDate: birthDate?.toISOString() || profile?.birthDate,
    });

    if (result) {
      console.log(result);
      if (profile) {
        setProfile({
          ...profile,
          image: image || profile?.image,
          gender,
          birthDate: birthDate?.toISOString() || profile?.birthDate,
        });
      }

      if (account) {
        setAccount({
          ...account,
          name,
        });
      }
      alert('Profile Updated');
      router.push('/(userScreens)/(settings)/profile/profile');
    }
    setInternalLoad(false);
    setIsAlertVisible(false);
  };

  useEffect(() => {
    setIsChanged(
      name !== account?.name ||
        gender !== profile?.gender ||
        birthDate?.toISOString() !== profile?.birthDate ||
        image !== profile?.image
    );
  }, [name, gender, birthDate, image, account, profile]);

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <ScrollView
      style={{
        backgroundColor: 'white',
      }}>
      <CustomAlert
        visible={isAlertVisible}
        title="Edit Personal Informations?"
        message="Are you sure you want to save the changes?"
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
      <View style={{ padding: 20, paddingStart: 25 }}>
        <BackButton />
      </View>
      {internalLoad && (
        <Modal>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10 }}>Loading...</Text>
          </View>
        </Modal>
      )}

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 15,
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

        <Pressable
          disabled={!isChanged}
          onPress={() => {
            setIsAlertVisible(true);
          }}
          style={
            isChanged
              ? {
                  backgroundColor: colorViolet,
                  padding: 20,
                  borderRadius: 30,
                  width: 200,
                  marginTop: 20,
                }
              : {
                  backgroundColor: 'grey',
                  padding: 20,
                  borderRadius: 30,
                  width: 200,
                  marginTop: 20,
                }
          }>
          <Text
            style={{
              fontSize: 16,
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
            }}>
            Save
          </Text>
        </Pressable>
      </View>
    </ScrollView>
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
