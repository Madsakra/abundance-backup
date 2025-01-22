import LottieView from 'lottie-react-native';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export default function LoadingAnimation() {
  const animation = useRef<LottieView>(null);
  return (
    <View style={styles.animationContainer}>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: '90%',
          height: '90%',
          marginBottom: '25%',
        }}
        source={require('assets/Lotties/Loading.json')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    zIndex: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
