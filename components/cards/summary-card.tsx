import { FontAwesome } from '@expo/vector-icons';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { View, Image, Text } from 'react-native';

import { formatFirestoreTime, formatFirestoreTimestamp } from '~/utils';

type SummaryCardProps = {
  title: string;
  imageUrl: string;
  calories: number;
  timestamp: FirebaseFirestoreTypes.Timestamp;
  type: string;
};

export default function SummaryCard({
  title,
  imageUrl,
  calories,
  timestamp,
  type,
}: SummaryCardProps) {
  return (
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
            source={{ uri: imageUrl }}
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
            {title}
          </Text>
          <Text
            style={{
              color: 'gray',
            }}>
            + {calories} kcal
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
            <Text>{formatFirestoreTimestamp(timestamp)}</Text>
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
            <Text>{formatFirestoreTime(timestamp)}</Text>
          </View>
        </View>
      </View>
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 18,
          textTransform: 'uppercase',
        }}>
        {type}
      </Text>
    </View>
  );
}
