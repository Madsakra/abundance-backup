import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

import { colorGreen } from '~/utils';

type ArticleCardProps = {
  title: string;
  imageUrl: string;
  onPress: () => void;
};

const ArticleCard = ({ title, imageUrl, onPress }: ArticleCardProps) => {
  return (
    <View style={styles.card}>
      {/* Article Image */}
      <Image source={{ uri: imageUrl }} style={styles.image} />

      {/* Title & Button */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* View Button */}
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 5,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    backgroundColor: colorGreen,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ArticleCard;
