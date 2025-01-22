import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { Link, router, useLocalSearchParams } from 'expo-router';
import OpenAI from 'openai';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import RNFS from 'react-native-fs';

import FunctionTiedButton from '~/components/FunctionTiedButton';
import { EdamamApiResponse } from '~/types/common/edaman';
import { EDAMAM_APP_ID, EDAMAM_APP_KEY, OPENAI_API_KEY } from '~/utils';

export default function CapturedPhoto() {
  const { media, type } = useLocalSearchParams();
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const [loading, setLoading] = useState(false);

  const analyzeImageWithOpenAI = async (imagePath: string) => {
    try {
      // Ensure the path has "file://" prefix
      const filePath = imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`;

      // Check if the file exists
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        console.warn('File does not exist at path:', filePath);
        return null;
      }

      // Read and convert image to Base64
      const base64Image = await RNFS.readFile(filePath, 'base64');

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Vision model for image analysis
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify the food in this image. Respond with only the food name.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 20,
      });

      const foodName = response.choices[0].message.content?.trim();
      return foodName;
    } catch (error) {
      console.error('Error identifying food', error);
      return null;
    }
  };

  const fetchNutritionDataFromEdamam = async (foodName: string) => {
    try {
      const response = await axios.get<EdamamApiResponse>('https://api.edamam.com/search', {
        params: {
          q: foodName,
          app_id: EDAMAM_APP_ID,
          app_key: EDAMAM_APP_KEY,
          to: 1,
        },
      });

      return response.data.hits[0].recipe;
    } catch (error: any) {
      console.error('Error fetching nutrition data:', error.message);
      return null;
    }
  };

  const handleAnalyzeImage = async () => {
    setLoading(true);
    if (typeof media !== 'string') {
      return;
    }

    const detectedFood = await analyzeImageWithOpenAI(media);
    if (detectedFood) {
      const nutritionData = await fetchNutritionDataFromEdamam(detectedFood);
      setLoading(false);
      router.push({
        pathname: '/(userScreens)/(caloriesAndGlucose)/calories/meal-detail/meal-detail',
        params: { item: JSON.stringify(nutritionData) },
      });
    } else {
      console.error('Failed to analyze the image.');
    }
  };

  return (
    <View>
      <Link
        style={{
          marginTop: 20,
          fontWeight: 'bold',
        }}
        href="/(userScreens)/(caloriesAndGlucose)/calories/food-scanner/food-scanner">
        <Entypo name="chevron-left" size={30} color="black" />
      </Link>
      {type === 'photo' ? (
        <Image
          source={{ uri: `${media}` }}
          style={{ width: '100%', height: '80%', resizeMode: 'contain' }}
        />
      ) : null}
      {type === 'base64' ? (
        <Image
          source={{ uri: `data:image/png;base64,${media}` }}
          style={{ width: '100%', height: '80%', resizeMode: 'contain' }}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FunctionTiedButton
          onPress={handleAnalyzeImage}
          title="Calculate Calories"
          buttonStyle={styles.buttonBox}
          textStyle={styles.buttonText}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonBox: {
    backgroundColor: '#C68F5E',
    paddingHorizontal: 10,
    borderRadius: 30,
    marginTop: 40,
  },

  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: 'white',
    padding: 10,
    textAlign: 'center',
  },
});
