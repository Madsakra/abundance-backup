import { Pressable, StyleProp, Text, TextStyle, ViewStyle } from 'react-native';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function FunctionTiedButton({
  onPress,
  title,
  buttonStyle,
  textStyle,
}: CustomButtonProps) {
  return (
    <Pressable style={buttonStyle} onPress={onPress}>
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}
