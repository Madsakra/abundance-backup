import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import SearchSection from '~/components/SearchSection';
import Toast from '~/components/notifications/toast';
import { useUserAccount } from '~/ctx';
import { EdamamApiResponse, EdamamItem } from '~/types/common/edaman';
import {
  EDAMAM_APP_ID,
  EDAMAM_APP_KEY,
  getCaloriesPerServing,
  toastError,
  toastInfo,
  toastRef,
} from '~/utils';

export default function CookedMeals() {
  const [foodName, setFoodName] = useState<string>('');
  const [data, setData] = useState<EdamamItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false); // Track if renewing search
  const { account } = useUserAccount();
  const router = useRouter();

  const baseUrl = 'https://api.edamam.com/api/recipes/v2';
  const params = {
    type: 'public',
    q: foodName,
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
    imageSize: 'SMALL',
    random: true,
  };

  // Trigger a new search
  const renewSearch = async () => {
    if (loading) return;

    setIsRenewing(true);
    setData([]); // Clear current data
    setHasMore(true);

    await searchForFood(); // Start new search
    setIsRenewing(false);
  };

  const searchForFood = async () => {
    if (!hasMore || loading) return;

    setLoading(true);

    try {
      const response = await axios.get<EdamamApiResponse>(baseUrl, { params });

      const newData: EdamamItem[] = response.data.hits.map((hit) => hit.recipe);

      setData((prevData) => [...prevData, ...newData]); // Append new results
      setHasMore(newData.length > 0); // Stop if no more results
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: EdamamItem }) => (
    <Pressable
      onPress={() => {
        router.push({
          pathname: '/(userScreens)/(caloriesAndGlucose)/calories/meal-detail/meal-detail',
          params: { item: JSON.stringify(item) },
        });
      }}
      style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc', flexDirection: 'row' }}>
      {/* Display the recipe image */}

      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 10,
            marginRight: 10, // Add spacing between image and text
          }}
        />
      ) : (
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 10,
            marginRight: 10,
            backgroundColor: 'gray',
          }}
        />
      )}

      <View style={{ flex: 1, gap: 10 }}>
        <Text
          style={{ fontSize: 18, fontFamily: 'Poppins-Medium' }}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.label}
        </Text>
        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 15, color: '#C68F5E' }}>
          {Math.round(getCaloriesPerServing(item))} kcal / 1 serving
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <Toast ref={toastRef} />
      <View style={styles.topHeaderContainer}>
        {/*FIRST ROW*/}
        <View style={styles.firstRowContainer}>
          <Text style={styles.headerText}>Cooked Meals</Text>

          <Pressable
            onPress={() => {
              if (account?.role === 'free_user') {
                toastInfo('Upgrade to premium to use this feature.');
                return;
              }
              router.push({
                pathname: '/(userScreens)/(caloriesAndGlucose)/calories/food-scanner/food-scanner',
              });
            }}
            style={styles.topRightButton}>
            <Ionicons name="camera" size={25} color="#C68F5E" />
            <Text style={styles.topRightButtonText}>Scan Food</Text>
          </Pressable>
        </View>

        {/*Input Row*/}
        <SearchSection value={foodName} setValue={setFoodName} searchFunction={renewSearch} />
      </View>

      {/* FlashList Section */}
      {isRenewing ? (
        // Show Activity Indicator during a new search
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : data.length > 0 ? (
        <FlashList
          data={data}
          renderItem={renderItem}
          estimatedItemSize={100}
          keyExtractor={(item, index) => `${item.label}-${index}`}
          onEndReached={searchForFood} // Load more data when reaching the end
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" color="#0000ff" style={{ margin: 10 }} />
            ) : null
          }
        />
      ) : (
        // Show "No data yet" when no data is available
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No data yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topHeaderContainer: {
    backgroundColor: '#C68F5E',
    paddingBottom: 10,
  },

  firstRowContainer: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },

  headerText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
  },

  topRightButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    display: 'flex',
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  topRightButtonText: {
    color: '#C68F5E',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
});
