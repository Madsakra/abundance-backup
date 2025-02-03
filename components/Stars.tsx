import React from "react";
import { View, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type StarsProps = {
  rating: number;
};




export default function Stars({rating}:StarsProps) {


    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
    return (
      <View style={styles.stars}>
        {Array.from({ length: fullStars }, (_, i) => (
          <View key={`full-${i}`} style={styles.starContainer}>
            <FontAwesome name="star" size={24} color="#8797DA" />
          </View>
        ))}
        {halfStar && (
          <View style={styles.starContainer}>
            <FontAwesome name="star-half" size={24} color="#8797DA" />
          </View>
        )}
        {Array.from({ length: emptyStars }, (_, i) => (
          <View key={`empty-${i}`} style={styles.starContainer}>
            <FontAwesome name="star-o" size={24} color="#8797DA" />
          </View>
        ))}
      </View>
    );
}

const styles = StyleSheet.create({
    stars: { 
        flexDirection: "row" 
    },
    starContainer: {
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
  });