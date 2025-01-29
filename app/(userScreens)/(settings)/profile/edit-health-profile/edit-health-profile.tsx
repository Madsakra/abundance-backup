import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import LoadingAnimation from '~/components/LoadingAnimation';
import { CustomAlert } from '~/components/alert-dialog/custom-alert-dialog';
import { useUserProfile } from '~/ctx';
import { Diet } from '~/types/common/diet';
import { HealthCondition } from '~/types/common/health-condition';
import { UserProfile } from '~/types/users/profile';
import { colorViolet } from '~/utils';

export default function EditHealthProfile() {
  const { profile, loading } = useUserProfile();
  const [dietaryRestrictions, setDietaryRestrictions] = useState<Diet[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([]);
  const [newDietaryRestrictions, setNewDietaryRestrictions] = useState<Diet[]>([]);
  const [newHealthConditions, setNewHealthConditions] = useState<HealthCondition[]>([]);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const router = useRouter();
  const user = auth().currentUser;

  useEffect(() => {
    const fetchDietaryRestrictions = async () => {
      try {
        const documentSnapshot = await firestore().collection('dietary_restrictions').get();

        const dietaryRestrictions = documentSnapshot.docs.map((doc) => doc.data() as Diet);
        setDietaryRestrictions(dietaryRestrictions);
        setNewDietaryRestrictions(profile?.profileDiet || []);
      } catch (error) {
        console.error('Error fetching dietary restrictions: ', error);
      }
    };

    const fetchHealthConditions = async () => {
      try {
        const documentSnapshot = await firestore().collection('health_conditions').get();

        const healthConditions = documentSnapshot.docs.map((doc) => doc.data() as HealthCondition);
        setHealthConditions(healthConditions);
        setNewHealthConditions(profile?.profileHealthCondi || []);
      } catch (error) {
        console.error('Error fetching health conditions: ', error);
      }
    };

    fetchDietaryRestrictions();
    fetchHealthConditions();
  }, [profile]);

  const updateHealthProfile = async (updateData: Partial<UserProfile>) => {
    try {
      await firestore()
        .collection('accounts')
        .doc(user?.uid)
        .collection('profile')
        .doc('profile_info')
        .update(updateData);

      console.log('Document successfully updated!');
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleClose = () => {
    setIsAlertVisible(false);
  };

  const handleConfirm = () => {
    updateHealthProfile({
      profileDiet: newDietaryRestrictions,
      profileHealthCondi: newHealthConditions,
    });
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
        title="Edit Health Profile?"
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
          Edit Health Informations
        </Text>
      </View>
      <View style={{ marginTop: 20 }}>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 16,
            fontWeight: 'bold',
            padding: 20,
          }}>
          Dietary Restrictions
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginHorizontal: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 10,
          }}>
          {dietaryRestrictions.map((restriction, index) => (
            <Pressable
              onPress={() => {
                setNewDietaryRestrictions((prev) => {
                  const isExist = newDietaryRestrictions.some(
                    (item) => item.name === restriction.name
                  );

                  if (isExist) {
                    return prev.filter((item) => item.name !== restriction.name);
                  }

                  return [...prev, restriction];
                });
              }}
              key={index}
              style={{
                padding: 15,
                backgroundColor: newDietaryRestrictions.some(
                  (item) => item.name === restriction.name
                )
                  ? colorViolet
                  : 'gray',
                borderRadius: 10,
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  paddingLeft: 20,
                }}>
                {restriction.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 16,
            fontWeight: 'bold',
            padding: 20,
          }}>
          Health Conditions
        </Text>

        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginHorizontal: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 10,
            marginBottom: 50,
          }}>
          {healthConditions.map((condition, index) => (
            <Pressable
              onPress={() => {
                setNewHealthConditions((prev) => {
                  const isExist = newHealthConditions.some((item) => item.name === condition.name);

                  if (isExist) {
                    return prev.filter((item) => item.name !== condition.name);
                  }

                  return [...prev, condition];
                });
              }}
              key={index}
              style={{
                padding: 15,
                backgroundColor: newHealthConditions.some((item) => item.name === condition.name)
                  ? colorViolet
                  : 'gray',
                borderRadius: 10,
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  paddingLeft: 20,
                }}>
                {condition.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 10,
            marginTop: 'auto',
            padding: 20,
          }}>
          <Pressable
            onPress={() => router.push('/(userScreens)/(settings)/settings')}
            style={{
              backgroundColor: 'gray',
              paddingVertical: 10,
              paddingHorizontal: 25,
              width: 150,
              borderRadius: 10,
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
              borderRadius: 10,
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
