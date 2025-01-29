import { View, Text } from 'react-native';

import { PersonalInformationType } from '~/app/(userScreens)/(settings)/profile/profile';
import { colorViolet } from '~/utils';

export const PersonalInformation = ({ title, icon }: PersonalInformationType) => {
  return (
    <View
      style={{
        padding: 15,
        backgroundColor: colorViolet,
        borderRadius: 100,
        width: '80%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}>
      {icon}
      <Text
        style={{
          color: 'white',
          fontSize: 16,
        }}>
        {title}
      </Text>
    </View>
  );
};
