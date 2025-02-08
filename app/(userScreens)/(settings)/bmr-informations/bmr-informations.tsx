import auth from '@react-native-firebase/auth';
import firestore, { doc, updateDoc } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

import LoadingAnimation from '~/components/LoadingAnimation';
import { CustomAlert } from '~/components/alert-dialog/custom-alert-dialog';
import { useUserProfile } from '~/ctx';
import { UserProfile } from '~/types/users/profile';
import { colorViolet, db } from '~/utils';

export default function BMRInformations() {
  const { profile, loading } = useUserProfile();
  const [height, setHeight] = useState<string>(profile?.height.toString() || '');
  const [weight, setWeight] = useState<string>(profile?.weight.toString() || '');
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const router = useRouter();
  const user = auth().currentUser;

  const updateBMR = async (updateData: Partial<UserProfile>) => {


    // PERFORM CHECKS
    if (height && weight)
    {
      const parsedHeight = parseFloat(height);
      const parsedWeight = parseFloat(weight);
        // Validate height and weight
        if (
          isNaN(parsedHeight) || isNaN(parsedWeight) ||
          parsedHeight <= 0 || parsedWeight <= 0 ||
          parsedHeight > 250 || parsedWeight > 300
        ) {
          alert('Please enter valid height (1-250 cm) and weight (1-300 kg).');
          return false;
        };

        if (!user) {
          alert("User not authenticated.");
          return false;
        }

        try {
          const profileDocRef = doc(db, "accounts", user.uid, "profile", "profile_info");

          // Update Firestore document
          await updateDoc(profileDocRef, {
            height: parsedHeight,
            weight: parsedWeight,
          });
          return true
        
        } catch (error) {
          console.error('Error updating document:', error);
        }
    
    }



  };

  const handleClose = () => {
    setIsAlertVisible(false);
  };

  const handleConfirm = async () => {
    const result = await updateBMR({
      height: parseInt(height, 10),
      weight: parseInt(weight, 10),
    });

    if (result)
    {
      setIsAlertVisible(false);
      alert("BMR Info updated successfully")
      router.navigate('/(userScreens)/(settings)/settings');
    };
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
        title="Edit BMR Informations?"
        message="Are you sure you want to save the changes?"
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
      <View
        style={{
          padding: 15,
          backgroundColor: colorViolet,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins',
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
          Edit BMR Informations
        </Text>
      </View>
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
          BMR Information
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 16,
            textAlign: 'center',
            padding: 20,
            color: 'gray',
          }}>
          This is for insulin prediction purposes
        </Text>
        <View
          style={{
            width: 130,
            height: 130,
            backgroundColor: 'gray',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={require('~/assets/profileCreation/BMR.jpg')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
        </View>
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
            <Text style={{ fontFamily: 'Poppins-Medium', marginBottom: 10 }}>Height(cm)</Text>
            <TextInput
              placeholder="Enter your height here..."
              value={height}
              onChangeText={(text) => setHeight(text)}
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
          }}>
          <View
            style={{
              backgroundColor: '#F0F0F0',
              paddingVertical: 10,
              paddingHorizontal: 25,
              width: '100%',
              borderRadius: 50,
            }}>
            <Text style={{ fontFamily: 'Poppins-Medium', marginBottom: 10 }}>Weight(kg)</Text>
            <TextInput
              placeholder="Enter your weight here..."
              value={weight}
              onChangeText={(text) => setWeight(text)}
              style={{
                width: '100%',
              }}
            />
          </View>
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
