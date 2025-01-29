import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import SettingCard from '~/components/settings/setting-card';
import { colorViolet } from '~/utils';

export type SettingLinkType = {
  title: string;
  icon: JSX.Element;
  uri: string;
};

const settingLinks: SettingLinkType[] = [
  {
    title: 'Profile',
    icon: <MaterialIcons name="person" size={24} color={colorViolet} />,
    uri: '/(userScreens)/(settings)/profile/profile',
  },
  {
    title: 'BMR Information',
    icon: <MaterialIcons name="monitor-heart" size={24} color={colorViolet} />,
    uri: '/(userScreens)/(settings)/bmr-informations/bmr-informations',
  },
  {
    title: 'Membership',
    icon: <MaterialIcons name="card-membership" size={24} color={colorViolet} />,
    uri: '/(userScreens)/(settings)/membership/membership',
  },
];

export default function Settings() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View
        style={{
          padding: 20,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 26,
            fontWeight: 'bold',
            color: colorViolet,
            marginTop: 20,
          }}>
          More Options
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 16,
            marginTop: 20,
            marginBottom: 50,
          }}>
          Select the following to manage different settings.
        </Text>
        <View
          style={{
            display: 'flex',
            gap: 20,
          }}>
          {settingLinks.map((link, index) => (
            <SettingCard key={index} {...link} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
