import { FontAwesome } from '@expo/vector-icons';
import { Link, RelativePathString } from 'expo-router';
import { Image, Text, View } from 'react-native';

import { colorBrown, imageMap } from '~/utils';

type ActionCardProps = {
  href: string;
  title: string;
  description: string;
  imageKey: string;
};

export default function ActionCard({ href, title, description, imageKey }: ActionCardProps) {
  return (
    <Link href={href as RelativePathString}>
      <View
        style={{
          display: 'flex',
          gap: 10,
          padding: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'gray',
          backgroundColor: 'white',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
        }}>
        <Text
          style={{
            color: colorBrown,
            fontWeight: 'bold',
          }}>
          {title}
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            justifyContent: 'center',
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
              source={imageMap[imageKey]}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
              }}
            />
          </View>
          <Text
            style={{
              color: colorBrown,
              width: 120,
            }}>
            {description}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 'auto',
          }}>
          <FontAwesome name="chevron-right" size={12} color="black" />
        </View>
      </View>
    </Link>
  );
}
