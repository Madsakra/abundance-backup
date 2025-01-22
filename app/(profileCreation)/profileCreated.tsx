import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import FunctionTiedButton from '~/components/FunctionTiedButton';

export default function profileCreated() {
  const nextSection = () => {
    router.dismissAll();
    router.replace('/');
  };

  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <View style={{ width: '80%' }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold', marginVertical: 15 }}>All Set!</Text>
        <Text style={{ fontSize: 20 }}>
          Welcome to abundance! Your journey to long life starts from here on!
        </Text>
        <Image
          source={require('assets/profileCreation/all_set.jpg')}
          style={{ width: 120, height: 120, alignSelf: 'center', marginVertical: 20 }}
        />

        <FunctionTiedButton
          buttonStyle={styles.buttonBox}
          onPress={nextSection}
          textStyle={styles.buttonText}
          title="Start"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonBox: {
    backgroundColor: '#00ACAC',
    borderRadius: 5,
    marginTop: '20%',
    width: '100%',
    alignSelf: 'center',
  },

  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: 'white',
    padding: 10,
    textAlign: 'center',
  },
});
