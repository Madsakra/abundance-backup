import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

type SearchSectionProps = {
  value: string;
  setValue: (event: string) => void;
  searchFunction: () => void;
};

export default function SearchSection({ value, setValue, searchFunction }: SearchSectionProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TextInput
        style={styles.input}
        placeholder="Search with your food name"
        value={value}
        onChangeText={setValue}
      />
      <Pressable style={styles.searchButton} onPress={searchFunction}>
        <Ionicons name="search-outline" size={20} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    padding: 10,
    margin: 15,
    flex: 0.9,
    justifyContent: 'center',
    borderRadius: 5,
  },

  searchButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 5,
  },
});
