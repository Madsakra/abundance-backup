import { AntDesign } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

import InputContainer from './InputContainer';

type DatePickerProps = {
  birthDate: Date | null;
  setBirthDate: (selectedDate: Date) => void;
};

export default function DatePicker({ birthDate, setBirthDate }: DatePickerProps) {
  const [mode, setMode] = useState<'date'>('date');
  const [show, setShow] = useState<boolean>(false);

  const showPicker = () => {
    setShow(true);
    setMode('date');
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate;
    setShow(Platform.OS === 'ios');

    if (currentDate) {
      setBirthDate(currentDate);
    }
  };

  return (
    <InputContainer inputLabel="Date" width="100%">
      <TouchableOpacity onPress={showPicker} style={styles.dateTimePickerTouch}>
        <AntDesign name="calendar" size={25} color="black" />
        {birthDate ? (
          <Text style={{ color: 'black', fontFamily: 'Poppins-Regular' }}>
            {birthDate.toLocaleDateString()}
          </Text>
        ) : (
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 15 }}>Choose your Birthdate</Text>
        )}
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={birthDate || new Date()}
          mode={mode}
          is24Hour
          display="default"
          onChange={onChange}
        />
      )}
    </InputContainer>
  );
}

const styles = StyleSheet.create({
  container: {},

  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#505050',
    fontFamily: 'Poppins-Regular',
  },

  dateTimePickerTouch: {
    borderRadius: 5,
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 2,
  },
});
