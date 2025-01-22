import Entypo from '@expo/vector-icons/Entypo';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import FunctionTiedButton from '~/components/FunctionTiedButton';
import Toast from '~/components/notifications/toast';
import { CaloriesTracking } from '~/types/common/calories';
import { EdamamItem } from '~/types/common/edaman';
import {
  currentUser,
  db,
  getCaloriesPerServing,
  getNutrient,
  toastError,
  toastRef,
  toastSuccess,
} from '~/utils';

export default function MealDetail() {
  const params = useLocalSearchParams();
  const item: EdamamItem = JSON.parse(params.item as string);
  const [caloriesConsumed, setCaloriesConsumed] = useState<string>('');

  const router = useRouter();

  const calculatedCalories = useMemo(() => {
    const calories = getCaloriesPerServing(item) * Number(caloriesConsumed);
    return Math.round(calories * 100) / 100;
  }, [caloriesConsumed]);

  const nutrientInfo = [
    {
      name: 'Carbs',
      value: `${getNutrient('CHOCDF', item)}g`,
    },
    {
      name: 'Fats',
      value: `${getNutrient('FAT', item)}g`,
    },
    {
      name: 'Protein',
      value: `${getNutrient('PROCNT', item)}g`,
    },
  ];

  async function uploadCalories() {
    if (!currentUser) return;

    const data: CaloriesTracking = {
      amount: calculatedCalories === 0 ? getCaloriesPerServing(item) : calculatedCalories,
      category: 'meal',
      food_info: {
        carbs: Number(getNutrient('CHOCDF', item)),
        fats: Number(getNutrient('FAT', item)),
        protein: Number(getNutrient('PROCNT', item)),
        name: item.label,
        image_url: item.image,
      },
      timestamp: new Date(Date.now()),
      type: 'input',
      userID: currentUser.uid,
    };

    try {
      await db
        .collection('calories')
        .add(data)
        .then(() => {
          toastSuccess('Uploaded Successfully');
          setTimeout(() => {
            router.push('/(userScreens)/(caloriesAndGlucose)/gateway');
          }, 1200);
        });
    } catch (err) {
      console.log(err);
      toastError('Something went wrong!');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Toast ref={toastRef} />
      <View
        style={{
          backgroundColor: 'white',
          padding: 15,
          paddingTop: 20,
          paddingBottom: 20,
          borderRadius: 10,
        }}>
        <Link
          style={{
            marginBottom: 30,
          }}
          href="/(userScreens)/(caloriesAndGlucose)/calories/cookedMeals">
          <Entypo name="chevron-left" size={30} color="black" />
        </Link>
        <View style={styles.infoContainer}>
          <View style={styles.info_container}>
            <Text style={styles.title}>{item.label}</Text>
            <Text style={styles.info_text}>Calories / Serving</Text>
            <Text style={styles.info_calories}>{getCaloriesPerServing(item)} kcal</Text>
          </View>
          <Image source={{ uri: item.image }} style={styles.image} />
        </View>
        <View style={{ padding: 10 }}>
          <View>
            <Text
              style={{
                opacity: 60,
                color: 'gray',
                fontWeight: 'bold',
                marginBottom: 5,
                fontSize: 16,
              }}>
              Total Servings
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
              }}>
              {item.yield}
            </Text>
          </View>
        </View>
        <View style={styles.nutrient_container}>
          {nutrientInfo.map((item, index) => {
            return (
              <View key={index}>
                <Text
                  style={{
                    opacity: 60,
                    color: 'gray',
                    fontWeight: 'bold',
                    marginBottom: 5,
                    fontSize: 16,
                  }}>
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}>
                  {item.value}
                </Text>
              </View>
            );
          })}
        </View>
        <View>
          <Text style={styles.title}>Calories Calculation</Text>
          <View style={styles.inputSection}>
            <View
              style={{
                backgroundColor: '#F0F0F0',
                paddingVertical: 10,
                paddingHorizontal: 25,
                width: '100%',
                borderRadius: 50,
              }}>
              <Text style={{ fontFamily: 'Poppins-Medium' }}>Servings Consumed</Text>
              <TextInput
                placeholder="Enter your serving consumed here..."
                value={caloriesConsumed}
                onChangeText={(text) => setCaloriesConsumed(text)}
                style={styles.inputBox}
              />
            </View>
          </View>
          <View style={styles.calories_calc}>
            <Text
              style={{
                fontSize: 18,
                marginBottom: 5,
                fontWeight: 'bold',
              }}>
              Net Calories Consumed
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: '#C68F5E',
                fontWeight: 'bold',
              }}>
              {calculatedCalories === 0 ? getCaloriesPerServing(item) : calculatedCalories} Kcal
            </Text>
          </View>
        </View>
        <FunctionTiedButton
          buttonStyle={styles.buttonBox}
          onPress={uploadCalories}
          textStyle={styles.buttonText}
          title="Log Food"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#C68F5E',
    fontFamily: 'Poppins',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info_container: {
    width: '50%',
  },
  info_calories: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C68F5E',
  },
  info_text: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  nutrient_container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
  },
  inputSection: {
    gap: 10,
    width: '100%',
  },
  inputBox: {
    width: '100%',
  },
  calories_calc: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    padding: 20,
    marginTop: 20,
    borderRadius: 10,
  },
  buttonBox: {
    backgroundColor: '#C68F5E',
    width: '100%',
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
