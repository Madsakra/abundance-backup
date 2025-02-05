import { FontAwesome5 } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CustomAlert } from '~/components/alert-dialog/custom-alert-dialog';
import { useUserProfile } from '~/ctx';
import { Goal } from '~/types/common/goal';
import { UserProfile } from '~/types/users/profile';
import { colorViolet } from '~/utils';

export default function EditGoals() {
  const { profile } = useUserProfile();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const router = useRouter();
  const user = auth().currentUser;

  async function fetchGoals() {
    const caloriesDocumentSnapshot = await firestore()
      .collection('predefined_goals_categories/calories/predefined_goals')
      .get();
    const glucoseDocumentSnapshot = await firestore()
      .collection('predefined_goals_categories/glucose/predefined_goals')
      .get();

    const caloriesGoals = caloriesDocumentSnapshot.docs.map((doc) => doc.data() as Goal);
    const glucoseGoals = glucoseDocumentSnapshot.docs.map((doc) => doc.data() as Goal);
    setGoals([...caloriesGoals, ...glucoseGoals]);
    setSelectedGoals(profile?.goals || []);
    console.log('goals', goals);
  }

  useEffect(() => {
    fetchGoals();
  }, [profile]);

  const handleClose = () => {
    setIsAlertVisible(false);
  };

  const updateGoalProfile = async (updateData: Partial<UserProfile>) => {
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

  const handleConfirm = () => {
    updateGoalProfile({
      goals: selectedGoals,
    });
    router.push('/(userScreens)/(goals)/goals');
    setIsAlertVisible(false);
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        height: '100%',
      }}>
      <CustomAlert
        visible={isAlertVisible}
        title="Edit Goals?"
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
          Edit Goals
        </Text>
      </View>

      <View
        style={{
          marginTop: 20,
          padding: 20,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 20,
            fontWeight: 'bold',
          }}>
          Select Goals
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 16,
            marginTop: 10,
            color: 'gray',
            width: '70%',
          }}>
          Tap on the goal to unselect old goals or select new goals.
        </Text>
      </View>

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
        {goals.map((goal, index) => (
          <Pressable
            onPress={() => {
              setSelectedGoals((prev) => {
                const isExist = selectedGoals.some((item) => {
                  if (item.categoryID === 'glucose') {
                    return item.categoryID === goal.categoryID;
                  }
                  return item.max === goal.max;
                });

                if (isExist) {
                  return prev.filter((item) => item.max !== goal.max);
                }

                return [...prev, goal];
              });
            }}
            key={index}
            style={{
              padding: 15,
              backgroundColor: selectedGoals.some((item) => item.max === goal.max)
                ? colorViolet
                : 'gray',
              borderRadius: 10,
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}>
            <FontAwesome5 name="fire" size={16} color="white" />
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                paddingLeft: 20,
              }}>
              {'<'} {goal.max} {goal.categoryID === 'calories' ? 'kcal' : 'mmol/L'}
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
  );
}
