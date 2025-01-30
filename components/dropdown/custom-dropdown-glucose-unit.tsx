import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlucoseUnit } from '~/types/common/glucose';

type DropDownGlucoseUnitProp = {
  selectedUnit: GlucoseUnit;
  setSelectedUnit: (unit: GlucoseUnit) => void;
};

export const CustomDropdownGlucoseUnit = ({
  selectedUnit,
  setSelectedUnit,
}: DropDownGlucoseUnitProp) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const units: GlucoseUnit[] = ['mmol/L', 'mg/dL'];

  return (
    <View style={styles.container}>
      {/* Dropdown Trigger */}
      <TouchableOpacity style={styles.dropdown} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
        <View>
          <Text style={styles.label}>Measurement Unit</Text>
          <Text style={styles.selectedText}>{selectedUnit}</Text>
        </View>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="gray" />
      </TouchableOpacity>

      {/* Dropdown List */}
      {isDropdownOpen && (
        <ScrollView style={styles.dropdownMenu} keyboardShouldPersistTaps="handled">
          {units.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedUnit(item);
                setIsDropdownOpen(false);
              }}>
              <Text style={styles.dropdownText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  dropdown: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: 'gray',
  },
  selectedText: {
    fontSize: 16,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
    position: 'absolute',
    width: '100%',
    zIndex: 10,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
  },
});
