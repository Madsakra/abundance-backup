import { useState } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Goal } from '~/types/common/goal';

type GoalTabProps = {
  // GENERIC T MEANS IT WILL BE ABLE TO ACCEPT ANY DATA
  tabBoxStyle: StyleProp<ViewStyle>;
  tabTextStyle: StyleProp<TextStyle>;
  tabValue: Goal;
  editable: boolean;
  handleInfo?: (goal:Goal) => void;
  isPressed?: boolean;
};

export default function GoalTab({  tabBoxStyle,
    tabTextStyle,
    tabValue,
    editable,
    handleInfo,
    isPressed}:GoalTabProps){

  const [pressed, setPressed] = useState(false);

  const pressedStyle = [tabBoxStyle, { backgroundColor: '#6B7FD6' }];
  const unpressedStyle = [tabBoxStyle, { backgroundColor: '#949494' }];

  const handlePress = () => {
    if (handleInfo) {
      setPressed((prev) => !prev);
      handleInfo(tabValue);
    }
  };


  return editable ? (
    <TouchableOpacity style={isPressed ? pressedStyle : unpressedStyle} onPress={handlePress}>
      <Text style={tabTextStyle}>
        {tabValue.min} - {tabValue.max} {tabValue.unit}
      </Text>
    </TouchableOpacity>
  ) : (
    <View style={isPressed ? pressedStyle : unpressedStyle}>
         {tabValue.min} - {tabValue.max} {tabValue.unit}
    </View>
  );
}
