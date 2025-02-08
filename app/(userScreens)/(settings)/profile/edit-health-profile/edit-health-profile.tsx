import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { Checkbox, RadioButton } from 'react-native-paper';

import LoadingAnimation from '~/components/LoadingAnimation';
import { CustomAlert } from '~/components/alert-dialog/custom-alert-dialog';
import { useUserProfile } from '~/ctx';
import { HealthProfileData, SelectedHealthProfile } from '~/types/common/health-condition';
import { UserProfile } from '~/types/users/profile';
import { colorViolet } from '~/utils';

export default function EditHealthProfile() {
  const { profile, loading } = useUserProfile();
  const [dietaryRestrictions, setDietaryRestrictions] = useState<HealthProfileData[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthProfileData[]>([]);
  const [newDietaryRestrictions, setNewDietaryRestrictions] = useState<SelectedHealthProfile[]>([]);
  const [newHealthConditions, setNewHealthConditions] = useState<SelectedHealthProfile[]>([]);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const router = useRouter();
  const user = auth().currentUser;

  useEffect(() => {
    const fetchDietaryRestrictions = async () => {
      if (!profile) return;
      try {
        const documentSnapshot = await firestore().collection('dietary_restrictions').get();

        const dietaryRestrictions = documentSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as HealthProfileData
        );
        setDietaryRestrictions(dietaryRestrictions);
        setNewDietaryRestrictions(profile!.profileDiet);
      } catch (error) {
        console.error('Error fetching dietary restrictions: ', error);
      }
    };

    const fetchHealthConditions = async () => {
      if (!profile) return;
      try {
        const documentSnapshot = await firestore().collection('health_conditions').get();

        const healthConditions = documentSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as HealthProfileData
        );

        setHealthConditions(healthConditions);
        setNewHealthConditions(profile!.profileHealthCondi);
      } catch (error) {
        console.error('Error fetching health conditions: ', error);
      }
    };

    fetchDietaryRestrictions();
    fetchHealthConditions();
  }, [profile]);

  const toggleCondition = (newItem: HealthProfileData, target: string) => {
    if (target === 'dietary_restriction') {
      setNewDietaryRestrictions((prev) => {
        const isAlreadySelected = prev.some((item) => item.id === newItem.id);

        // If the condition is already selected, remove it from the state.
        if (isAlreadySelected) {
          return prev.filter((item) => item.id !== newItem.id);
        }

        // If it's not selected, add it to the state.
        return [...prev, { id: newItem.id, name: newItem.name, variation: '' }];
      });
    } else {
      setNewHealthConditions((prev) => {
        const isAlreadySelected = prev.some((item) => item.id === newItem.id);

        // If the condition is already selected, remove it from the state.
        if (isAlreadySelected) {
          return prev.filter((item) => item.id !== newItem.id);
        }

        // If it's not selected, add it to the state.
        return [...prev, { id: newItem.id, name: newItem.name, variation: '' }];
      });
    }
  };

  const selectVariation = (conditionId: string, variation: string, target: string) => {
    if (target === 'dietary_restriction') {
      setNewDietaryRestrictions((prev) =>
        prev.map((condi) => (condi.id === conditionId ? { ...condi, variation } : condi))
      );
    } else {
      setNewHealthConditions((prev) =>
        prev.map((condi) => (condi.id === conditionId ? { ...condi, variation } : condi))
      );
    }
  };

  const updateHealthProfile = async (updateData: Partial<UserProfile>) => {

    const hasPrimaryDiet = newDietaryRestrictions.some((diet) => diet.name === 'Primary diet');

    if (!hasPrimaryDiet) {
      // Show a warning or alert if no primary diet is selected
      alert('Please select at least one primary diet.');
      return; // Prevent submitting
    }

    else{
      try {
        await firestore()
          .collection('accounts')
          .doc(user?.uid)
          .collection('profile')
          .doc('profile_info')
          .update(updateData);
          alert("Health profile updated successfully")
        router.replace('/(userScreens)/(settings)/settings');

      } catch (error) {
        console.error('Error updating document:', error);
      }
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
    setIsAlertVisible(false);
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <ScrollView
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

        {/*DIETARY RESTRICTIONS SELECTION*/}
        {dietaryRestrictions.map((diet) => {
          const isSelected = newDietaryRestrictions.some((newDiet) => diet.id === newDiet.id);
          const selectedVariation =
            newDietaryRestrictions.find((newDiet) => newDiet.id === diet.id)?.variation || '';

          return (
            <View key={diet.id} style={{ marginBottom: 20 }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  backgroundColor: isSelected ? '#ddd' : '#f8f8f8',
                  borderRadius: 5,
                }}
                onPress={() => toggleCondition(diet, 'dietary_restriction')}>
                <Checkbox status={isSelected ? 'checked' : 'unchecked'} />
                <Text style={{ fontSize: 16, marginLeft: 10 }}>{diet.name}</Text>
              </TouchableOpacity>

              {isSelected && diet.variation.length > 0 && (
                <View style={{ paddingLeft: 30, marginTop: 5 }}>
                  {diet.variation.map((variant) => (
                    <TouchableOpacity
                      key={variant}
                      onPress={() => selectVariation(diet.id, variant, 'dietary_restriction')}
                      style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                      <RadioButton.Android
                        value={variant}
                        status={selectedVariation === variant ? 'checked' : 'unchecked'}
                        onPress={() => selectVariation(diet.id, variant, 'dietary_restriction')}
                      />
                      <Text style={{ fontSize: 14, marginLeft: 10 }}>{variant}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/*HEALTH CONDITION SELECTION*/}

      <Text
        style={{
          fontFamily: 'Poppins',
          fontSize: 16,
          fontWeight: 'bold',
          padding: 20,
        }}>
        Health Conditions
      </Text>

      {healthConditions.map((condi) => {
        const isSelected = newHealthConditions.some((newCondi) => condi.id === newCondi.id);
        const selectedVariation =
          newHealthConditions.find((newCondi) => condi.id === newCondi.id)?.variation || '';

        return (
          <View key={condi.id} style={{ marginBottom: 20 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                backgroundColor: isSelected ? '#ddd' : '#f8f8f8',
                borderRadius: 5,
              }}
              onPress={() => toggleCondition(condi, 'health_condition')}>
              <Checkbox status={isSelected ? 'checked' : 'unchecked'} />
              <Text style={{ fontSize: 16, marginLeft: 10 }}>{condi.name}</Text>
            </TouchableOpacity>

            {isSelected && condi.variation.length > 0 && (
              <View style={{ paddingLeft: 30, marginTop: 5 }}>
                {condi.variation.map((variant) => (
                  <TouchableOpacity
                    key={variant}
                    onPress={() => selectVariation(condi.id, variant, 'health')}
                    style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                    <RadioButton.Android
                      value={variant}
                      status={selectedVariation === variant ? 'checked' : 'unchecked'}
                      onPress={() => selectVariation(condi.id, variant, 'health')}
                    />
                    <Text style={{ fontSize: 14, marginLeft: 10 }}>{variant}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}

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
    </ScrollView>
  );
}
