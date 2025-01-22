import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CameraButtonProps {
  onPress: () => void;
  title?: string;
  iconName?: ComponentProps<typeof Ionicons>['name'];
  containerStyle?: StyleProp<ViewStyle>;
  iconSize?: number;
}

export default function CameraButton({
  onPress,
  iconName,
  title,
  containerStyle,
  iconSize,
}: CameraButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { borderRadius: 10, alignSelf: 'flex-end' }, containerStyle]}>
      {iconName && <Ionicons name={iconName} size={iconSize ?? 28} color="black" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 7,
    flexDirection: 'row',
    borderWidth: 1,
    gap: 7,
  },
});
