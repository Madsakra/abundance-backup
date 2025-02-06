import { router } from 'expo-router';
import { Image, Pressable, Text, View, ImageProps, StyleSheet } from 'react-native';

type PermissionCompProps = {
  subTitle: string;
  buttonTitle: string;
  handleFunction: () => void;
  image: ImageProps;
  themeColor: string;
  secondaryAction?: () => void;
  subActionText?: string;
};

export default function PermissionView({
  subTitle,
  buttonTitle,
  handleFunction,
  image,
  themeColor,
  secondaryAction,
  subActionText,
}: PermissionCompProps) {
  return (
    <View style={styles.container}>
      {secondaryAction && (
        <Pressable
          onPress={secondaryAction}
          style={{
            backgroundColor: themeColor,
            alignSelf: 'flex-end',
            padding: 10,
            borderRadius: 30,
            marginRight: 10,
          }}>
          <Text style={styles.subActionText}>{subActionText}</Text>
        </Pressable>
      )}

      <Image source={image} style={styles.image} />
      <Text style={styles.mainTitle}>Requires Permission</Text>
      <Text style={styles.subTitle}>{subTitle}</Text>

      <Pressable
        onPress={handleFunction}
        style={[styles.actionButton, { backgroundColor: themeColor }]}>
        <Text style={styles.actionText}>{buttonTitle}</Text>
      </Pressable>

      <Pressable
        style={{ padding: 20 }}
        onPress={() =>
          router.navigate('/(userScreens)/(caloriesAndGlucose)/calories/output/activityGateway')
        }>
        <Text style={{ color: themeColor, fontWeight: 'bold' }}>Not Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },

  image: {
    marginTop: 20,
    width: 200,
    height: 200,
  },

  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  subTitle: {
    padding: 30,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
  },

  actionButton: {
    padding: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
  },

  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  subActionText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});
