import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RelativePathString, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

import { SettingLinkType } from '~/app/(userScreens)/(settings)/settings';
import { colorViolet } from '~/utils';

export default function SettingCard({ title, icon, uri }: SettingLinkType) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.replace(uri as RelativePathString)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 15,
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 10,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View
          style={{
            borderRadius: 100,
            height: 40,
            width: 40,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(107, 127, 214, 0.1)',
          }}>
          {icon}
        </View>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 16,
            color: colorViolet,
            flexShrink: 1,
            fontWeight: 'bold',
          }}>
          {title}
        </Text>
      </View>
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <MaterialCommunityIcons name="arrow-right-thin" size={24} color={colorViolet} />
      </View>
    </Pressable>
  );
}
