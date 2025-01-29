import { FontAwesome } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import CaloriesConsumedCard from '~/components/calories-chart-card/calories-consumed-card';
import ActionCard from '~/components/cards/action-card';
import { CaloriesTracking } from '~/types/common/calories';
import { colorBrown } from '~/utils';

export default function CaloriesGraph() {
  const user = auth().currentUser;
  const currentDate = new Date(Date.now());

  const [caloriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const userId = user?.uid || '';

  async function fetchCaloriesConsumed(timestamp: Date) {
    const startOfDay = new Date(timestamp.setHours(0, 0, 0, 0)); // 00:00:00
    const endOfDay = new Date(timestamp.setHours(23, 59, 59, 999)); // 23:59:59

    const startTimestamp = firestore.Timestamp.fromDate(startOfDay);
    const endTimestamp = firestore.Timestamp.fromDate(endOfDay);

    try {
      const documentSnapshot = await firestore()
        .collection('calories')
        .where('userID', '==', userId)
        .where('type', '==', 'input')
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .get();

      const calories = documentSnapshot.docs.map((doc) => doc.data() as CaloriesTracking);
      setCaloriesConsumedToday(calories);
      console.log('Calories consumed today: ', calories);
    } catch (error) {
      console.error('Error fetching caloreis consumed today: ', error);
    }
  }

  const formatFirestoreTimestamp = (timestamp: FirebaseFirestoreTypes.Timestamp): string => {
    if (!timestamp) return 'Invalid Date';

    const date = timestamp.toDate();
    return date.toLocaleDateString('en-GB');
  };

  const formatFirestoreTime = (timestamp: FirebaseFirestoreTypes.Timestamp): string => {
    if (!timestamp) return 'Invalid Time';

    const date = timestamp.toDate();

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true, // Enables 12-hour format
    }).format(date);
  };

  useEffect(() => {
    fetchCaloriesConsumed(currentDate);
  }, []);

  return (
    <ScrollView
      style={{
        height: '100%',
        flex: 1,
        position: 'relative',
        backgroundColor: 'white',
      }}>
      <CaloriesConsumedCard />
      <View
        style={{
          padding: 20,
          marginTop: 20,
        }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
            color: colorBrown,
          }}>
          Actions
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 10,
          }}>
          <ActionCard
            href="/(userScreens)/(caloriesAndGlucose)/calories/cookedMeals"
            title="Add Calories Input"
            description="Log Food Consumption"
            imageKey="caloriesInput"
          />
          <ActionCard
            href="/"
            title="Add Calories Output"
            description="Log Food Output"
            imageKey="caloriesOutput"
          />
        </View>
      </View>
      <View
        style={{
          padding: 20,
        }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 15,
            color: colorBrown,
          }}>
          Graphed Data
        </Text>
        <Text
          style={{
            fontSize: 16,
            marginBottom: 10,
          }}>
          Data Movement
        </Text>
        <View>
          {caloriesConsumedToday.map((item, index) => (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 10,
                padding: 15,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: 'gray',
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={{ uri: item.food_info.image_url }}
                    style={{
                      width: '100%',
                      height: '100%',
                      resizeMode: 'cover',
                    }}
                  />
                </View>
                <View>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      width: 130,
                      marginBottom: 5,
                    }}>
                    {item.food_info.name}
                  </Text>
                  <Text
                    style={{
                      color: 'gray',
                    }}>
                    + {item.amount} kcal
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 10,
                    }}>
                    <FontAwesome
                      style={{
                        marginRight: 10,
                      }}
                      name="calendar"
                      size={16}
                      color="black"
                    />
                    <Text>{formatFirestoreTimestamp(item.timestamp)}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <FontAwesome
                      style={{
                        marginRight: 10,
                      }}
                      name="clock-o"
                      size={16}
                      color="black"
                    />
                    <Text>{formatFirestoreTime(item.timestamp)}</Text>
                  </View>
                </View>
              </View>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  textTransform: 'uppercase',
                }}>
                {item.type}
              </Text>
            </View>
          ))}
          <View
            style={{
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 10,
              padding: 15,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: 'gray',
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  source={{ uri: '' }}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                    backgroundColor: 'white',
                  }}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    width: 130,
                    marginBottom: 5,
                  }}>
                  Net Calories Intake
                </Text>
                <Text
                  style={{
                    color: 'gray',
                  }}>
                  {caloriesConsumedToday.reduce((acc, item) => acc + item.amount, 0)} kcal
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 10,
                  }}>
                  <FontAwesome
                    style={{
                      marginRight: 10,
                    }}
                    name="calendar"
                    size={16}
                    color="black"
                  />
                  <Text>{formatDate(new Date())}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <FontAwesome
                    style={{
                      marginRight: 10,
                    }}
                    name="clock-o"
                    size={16}
                    color="black"
                  />
                  <Text>{formatTime(new Date())}</Text>
                </View>
              </View>
            </View>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                textTransform: 'uppercase',
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
