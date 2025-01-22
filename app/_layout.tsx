import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { UserAccountProvider, UserProfileProvider } from '~/ctx';

export default function RootLayout() {
  SplashScreen.preventAutoHideAsync();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();
  const segments = useSegments();

  //   const [loaded,error] = useFonts({
  //     'Poppins-ExtraLight':require('../assets/fonts/Poppins-ExtraLight.ttf'),
  //     'Poppins-Light':require('../assets/fonts/Poppins-Light.ttf'),
  //     'Poppins-Regular':require('../assets/fonts/Poppins-Regular.ttf'),
  //     'Poppins-Medium':require('../assets/fonts/Poppins-Medium.ttf'),
  //     'Poppins-SemiBold':require('../assets/fonts/Poppins-SemiBold.ttf'),
  //     'Poppins-Bold':require('../assets/fonts/Poppins-Bold.ttf'),
  //     'Poppins-ExtraBold':require('../assets/fonts/Poppins-ExtraBold.ttf'),
  //     'Poppins-Black':require('../assets/fonts/Poppins-Black.ttf'),
  //   })

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log('user:', user);
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(userScreens)';
    console.log(inAuthGroup);

    if (user && !inAuthGroup) {
      router.replace('/');
    } else if (!user && inAuthGroup) {
      router.replace('/sign-in');
    } else if (!user && !inAuthGroup) {
      router.replace('/sign-in');
    }
  }, [user, initializing]);

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(userScreens)';
    console.log(inAuthGroup);

    if (user && !inAuthGroup) {
      router.replace('/');
    } else if (!user && inAuthGroup) {
      router.replace('/sign-in');
    } else if (!user && !inAuthGroup) {
      router.replace('/sign-in');
    }
  }, [user, initializing]);

  return (
    <UserAccountProvider>
      <UserProfileProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Slot />
        </GestureHandlerRootView>
      </UserProfileProvider>
    </UserAccountProvider>
  );
}
