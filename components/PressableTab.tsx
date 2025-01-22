import { useState } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';

type PressableTabProps<T> = {
  // GENERIC T MEANS IT WILL BE ABLE TO ACCEPT ANY DATA
  tabBoxStyle: StyleProp<ViewStyle>;
  tabTextStyle: StyleProp<TextStyle>;
  tabValue: T;
  editable: boolean;
  handleInfo?: (diet: T) => void;
  SvgIcon?: React.FC<SvgProps>; // Optional SVG icon
  isPressed?: boolean;
};

export default function PressableTab<T>({
  tabBoxStyle,
  tabTextStyle,
  tabValue,
  editable,
  handleInfo,
  SvgIcon,
  isPressed,
}: PressableTabProps<T>) {
  const [pressed, setPressed] = useState(false);

  const pressedStyle = [tabBoxStyle, { backgroundColor: '#6B7FD6' }];
  const unpressedStyle = [tabBoxStyle, { backgroundColor: '#949494' }];

  const handlePress = () => {
    if (handleInfo) {
      setPressed((prev) => !prev);
      handleInfo(tabValue);
    }
  };

  const displayText =
    typeof tabValue === 'object' && tabValue !== null
      ? (tabValue as any).name // Safely access object property
      : String(tabValue); // Convert primitive to string

  return editable ? (
    <TouchableOpacity style={isPressed ? pressedStyle : unpressedStyle} onPress={handlePress}>
      <Text style={tabTextStyle}>
        {SvgIcon && <SvgIcon />} {displayText}
      </Text>
    </TouchableOpacity>
  ) : (
    <View style={isPressed ? pressedStyle : unpressedStyle}>
      {SvgIcon && <SvgIcon />}
      <Text style={tabTextStyle}>{displayText}</Text>
    </View>
  );
}
