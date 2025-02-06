import { MaterialIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  fetchAllGlucoseReadingForToday,
  fetchArticles,
  fetchCaloriesConsumed,
  fetchCaloriesConsumedLatest,
  fetchCaloriesOutput,
} from '~/actions/actions';
import FunctionTiedButton from '~/components/FunctionTiedButton';
import CaloriesConsumedCard from '~/components/calories-chart-card/calories-consumed-card';
import ArticleCard from '~/components/cards/article-card';
import GlucoseGraphCard from '~/components/cards/glucose-chart-card';
import ProgressCard from '~/components/cards/progress-card';
import { useUserProfile } from '~/ctx';
import { CaloriesOutputTracking, CaloriesTracking } from '~/types/common/calories';
import { GlucoseReading } from '~/types/common/glucose';
import { colorBrown, colorGreen } from '~/utils';

export default function Index() {
  const user = auth().currentUser;
  const userId = user?.uid || '';

  const { profile } = useUserProfile();

  const [selectedTab, setSelectedTab] = useState<string>('calories');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(Date.now()));

  const [caloriesConsumedToday, setCaloriesConsumedToday] = useState<CaloriesTracking[]>([]);
  const [caloriesOutputToday, setCaloriesOutputToday] = useState<CaloriesOutputTracking[]>([]);
  const [latestCaloriesConsumed, setLatestCaloriesConsumed] = useState<CaloriesTracking | null>(
    null
  );

  const [totalGlucoseToday, setTotalGlucoseToday] = useState<GlucoseReading[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  const router = useRouter();

  const totalCaloriesConsumed = caloriesConsumedToday.reduce((acc, item) => acc + item.amount, 0);
  const totalGlucose = totalGlucoseToday.reduce((acc, curr) => {
    if (curr.unit === 'mg/dL') {
      return acc + curr.reading / 18.0182;
    }
    return acc + curr.reading;
  }, 0);

  const totalCalories =
    caloriesConsumedToday.reduce((acc, curr) => acc + curr.amount, 0) -
    caloriesOutputToday.reduce((acc, curr) => acc + curr.amount, 0);

  useEffect(() => {
    let unsubscribeConsumed: () => void;
    let unsubscribeLatestConsumed: () => void;
    let unsubscribeCaloriesOutput: () => void;
    let unsubscribeGlucose: () => void;
    let unsubscribeArticles: () => void;

    (async () => {
      unsubscribeConsumed = await fetchCaloriesConsumed(
        currentDate,
        userId,
        setCaloriesConsumedToday
      );
      unsubscribeLatestConsumed = await fetchCaloriesConsumedLatest(
        userId,
        setLatestCaloriesConsumed
      );
      unsubscribeCaloriesOutput = await fetchCaloriesOutput(
        currentDate,
        userId,
        setCaloriesOutputToday
      );
      unsubscribeGlucose = await fetchAllGlucoseReadingForToday(
        currentDate,
        userId,
        setTotalGlucoseToday
      );
      unsubscribeArticles = await fetchArticles(setArticles);
    })();

    return () => {
      if (unsubscribeConsumed) unsubscribeConsumed();
      if (unsubscribeLatestConsumed) unsubscribeLatestConsumed();
      if (unsubscribeCaloriesOutput) unsubscribeCaloriesOutput();
      if (unsubscribeGlucose) unsubscribeGlucose();
      if (unsubscribeArticles) unsubscribeArticles();
    };
  }, [currentDate, userId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          marginTop: 20,
          color: colorGreen,
          paddingHorizontal: 20,
        }}>
        Key Metrics
      </Text>
      <View
        style={{
          marginTop: 20,
          width: '100%',
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            margin: 'auto',
            paddingHorizontal: 20,
          }}>
          <FunctionTiedButton
            buttonStyle={{
              backgroundColor: selectedTab === 'calories' ? colorBrown : 'white',
              borderRadius: 10,
              width: '50%',
            }}
            onPress={() => setSelectedTab('calories')}
            textStyle={{
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
              color: selectedTab === 'calories' ? 'white' : 'black',
              padding: 12,
              textAlign: 'center',
            }}
            title="Calories"
          />
          <FunctionTiedButton
            buttonStyle={{
              backgroundColor: selectedTab === 'glucose' ? colorBrown : 'white',
              borderRadius: 10,
              width: '50%',
            }}
            onPress={() => setSelectedTab('glucose')}
            textStyle={{
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
              color: selectedTab === 'glucose' ? 'white' : 'black',
              padding: 12,
              textAlign: 'center',
            }}
            title="Glucose"
          />
        </View>
        <View
          style={{
            margin: 'auto',
            width: '100%',
          }}>
          {selectedTab === 'calories' ? (
            <CaloriesConsumedCard
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              netCaloriesConsumed={100}
              showDate={false}
              showNetCalories={false}
            />
          ) : (
            <GlucoseGraphCard
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              showDate={false}
            />
          )}
        </View>
        <View
          style={{
            margin: 'auto',
            marginTop: 20,
            padding: 20,
            width: '90%',
            backgroundColor: 'white',
            borderRadius: 10,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
            }}>
            Latest calories consumed
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 10,
              alignItems: 'center',
            }}>
            <MaterialIcons name="local-fire-department" size={24} color={colorBrown} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginLeft: 10,
                color: colorBrown,
              }}>
              {latestCaloriesConsumed ? Math.round(latestCaloriesConsumed.amount * 100) / 100 : 0}{' '}
              kcal
            </Text>
          </View>
        </View>
        <View
          style={{
            margin: 'auto',
            marginTop: 10,
            padding: 20,
            width: '90%',
            backgroundColor: 'white',
            borderRadius: 10,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
            }}>
            Total calories consumed Today
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 10,
              alignItems: 'center',
            }}>
            <MaterialIcons name="local-fire-department" size={24} color={colorBrown} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginLeft: 10,
                color: colorBrown,
              }}>
              {Math.round(totalCaloriesConsumed * 100) / 100} kcal
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            marginTop: 20,
            color: colorGreen,
            paddingHorizontal: 20,
          }}>
          Goals
        </Text>
        <View
          style={{
            width: '90%',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            marginTop: 20,
          }}>
          {profile?.goals.map((goal, index) => (
            <ProgressCard
              key={index}
              currentValue={
                goal.categoryID === 'calories'
                  ? Math.round(totalCalories * 100) / 100
                  : Math.round(totalGlucose * 100) / 100
              }
              goalValue={goal.max}
              title={goal.categoryID}
              iconName={goal.categoryID === 'calories' ? 'fire' : 'tint'}
              color={colorGreen}
            />
          ))}
        </View>
        <View
          style={{
            width: '90%',
            margin: 'auto',
            marginTop: 20,
            marginBottom: 40,
            display: 'flex',
            flexDirection: 'column',
            padding: 20,
            backgroundColor: '#f0f0f0',
            borderRadius: 30,
          }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colorGreen,
            }}>
            Free Articles
          </Text>
          <Text
            style={{
              fontSize: 16,
              marginTop: 10,
            }}>
            Feel Free To Read Articles from Nutritionists and improve your health accordingly.
          </Text>
          <View
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              gap: 10,
            }}>
            {articles.map((article, index) => (
              <ArticleCard
                key={index}
                title={article.title}
                imageUrl={article.image}
                onPress={() => {
                  router.push({
                    pathname: '/article-details',
                    params: { id: article.id },
                  });
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
