import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import LoadingAnimation from '~/components/LoadingAnimation';
import { PersonalInformation } from '~/components/profiles/personal-informations';
import { useUserAccount, useUserProfile } from '~/ctx';
import { Diet } from '~/types/common/diet';
import { HealthCondition, HealthProfileData } from '~/types/common/health-condition';
import { colorViolet } from '~/utils';

export type PersonalInformationType = {
  title: string;
  icon: JSX.Element;
};

export default function Profile() {
  const { profile, loading } = useUserProfile();
  const { account } = useUserAccount();

  const [dietaryRestrictions, setDietaryRestrictions] = useState<HealthProfileData[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthProfileData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDietaryRestrictions = async () => {
      try {
        const documentSnapshot = await firestore().collection('dietary_restrictions').get();

        const dietaryRestrictions = documentSnapshot.docs.map((doc) => doc.data() as HealthProfileData);
        setDietaryRestrictions(dietaryRestrictions);
      } catch (error) {
        console.error('Error fetching dietary restrictions: ', error);
      }
    };

    const fetchHealthConditions = async () => {
      try {
        const documentSnapshot = await firestore().collection('health_conditions').get();

        const healthConditions = documentSnapshot.docs.map((doc) => doc.data() as HealthProfileData);
        setHealthConditions(healthConditions);
        console.log('Health conditions: ', healthConditions);
      } catch (error) {
        console.error('Error fetching health conditions: ', error);
      }
    };

    fetchDietaryRestrictions();
    fetchHealthConditions();
  }, []);

  const calculateAge = (birthdate: string | undefined) => {
    if (!birthdate) return 0;

    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  const parseBirthdate = (birthdate: string | undefined) => {
    if (!birthdate) return '';
    const date = new Date(birthdate);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const personalInformation: PersonalInformationType[] = [
    {
      title: parseBirthdate(profile?.birthDate),
      icon: <MaterialIcons name="calendar-month" size={24} color="white" />,
    },
    {
      title: account?.email || '',
      icon: <MaterialIcons name="email" size={24} color="white" />,
    },
    {
      title: calculateAge(profile?.birthDate).toString(),
      icon: (
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
          Age
        </Text>
      ),
    },

    {
      title: profile?.gender || '',
      icon:
        profile?.gender === 'male' ? (
          <MaterialCommunityIcons name="gender-male" size={24} color="white" />
        ) : (
          <MaterialCommunityIcons name="gender-female" size={24} color="white" />
        ),
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          marginTop: 20,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 26,
            color: colorViolet,
            flexShrink: 1,
            fontWeight: 'bold',
          }}>
          Personal Information
        </Text>
        <Pressable
          onPress={() => router.push('/(userScreens)/(settings)/profile/edit-profile/edit-profile')}
          style={{
            borderRadius: 8,
            height: 35,
            width: 35,
            backgroundColor: colorViolet,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MaterialIcons name="edit" size={20} color="white" />
        </Pressable>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
        }}>
        <View
          style={{
            width: 130,
            height: 130,
            borderRadius: 100,
            backgroundColor: 'gray',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={{ uri: profile?.image || '' }}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 20,
            flexShrink: 1,
          }}>
          {account?.name}
        </Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          marginTop: 20,
        }}>
        {personalInformation.map((info, index) => (
          <PersonalInformation key={index} {...info} />
        ))}
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          marginTop: 20,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 26,
            color: colorViolet,
            flexShrink: 1,
            fontWeight: 'bold',
          }}>
          Health Profile
        </Text>
        <Pressable
          onPress={() =>
            router.push('/(userScreens)/(settings)/profile/edit-health-profile/edit-health-profile')
          }
          style={{
            borderRadius: 8,
            height: 35,
            width: 35,
            backgroundColor: colorViolet,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MaterialIcons name="edit" size={20} color="white" />
        </Pressable>
      </View>
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
          <View
            key={index}
            style={{
              padding: 15,
              backgroundColor: profile?.profileDiet.some((item) => item.name === restriction.name)
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
              {restriction.variation.length > 0 &&
                restriction.variation
                  .filter((variation) =>
                    profile?.profileDiet.some(
                      (item) => item.name === restriction.name && item.variation?.includes(variation)
                    )
                  )
                  .map((variation, idx) => `- ${variation}${idx !== restriction.variation.length - 1 ? '\n' : ''}`)
                  .join('')}
            </Text>
          </View>
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
          <View
            key={index}
            style={{
              padding: 15,
              backgroundColor: profile?.profileHealthCondi.some((item) => item.name === condition.name)
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
              {condition.variation.length > 0 &&
                condition.variation
                  .filter((variation) =>
                    profile?.profileHealthCondi.some(
                      (item) => item.name === condition.name && item.variation?.includes(variation)
                    )
                  )
                  .map((variation, idx) => `- ${variation}${idx !== condition.variation.length - 1 ? '\n' : ''}`)
                  .join('')}
            </Text>
          </View>
        ))}
      </View>
      <View />
    </ScrollView>
  );
}
