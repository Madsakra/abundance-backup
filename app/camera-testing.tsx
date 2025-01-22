import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, Pressable } from 'react-native-gesture-handler';
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Camera,
  CameraProps,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

export default function CameraTesting() {
  Reanimated.addWhitelistedNativeProps({
    zoom: true,
  });
  const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
  const device = useCameraDevice('back');

  const { hasPermission } = useCameraPermission();
  const redirectToPermissions = !hasPermission;
  const router = useRouter();
  const camera = useRef<Camera>(null);
  const zoom = useSharedValue(device?.neutralZoom);
  const zoomOffset = useSharedValue(0);

  const animatedProps = useAnimatedProps<CameraProps>(() => ({ zoom: zoom.value }), [zoom]);

  // check if user has camera
  if (!device) return <Text>Your device does not have a camera!</Text>;

  // ZOOM PINCH SECTION
  const gesture = Gesture.Pinch()
    .onBegin(() => {
      if (zoom && zoom.value !== undefined) {
        zoomOffset.value = zoom.value;
      }
    })
    .onUpdate((event) => {
      const z = zoomOffset.value * event.scale;
      zoom.value = interpolate(z, [1, 10], [device.minZoom, device.maxZoom], Extrapolation.CLAMP);
    });

  const takePicture = async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');
      const photo = await camera.current.takePhoto({
        enableShutterSound: false,
      });

      router.push({
        pathname: '/captured-photo',
        params: { media: photo.path, type: 'photo' },
      });
    } catch (e) {
      console.log(e);
    }
  };

  // IMAGE LIBRARY
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const media = result.assets[0].uri;
      router.push({
        pathname: '/captured-photo',
        params: { media, type: 'photo' },
      });
    }
  };
  //------------------------------

  if (redirectToPermissions) return <Redirect href="/permissions" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 2.5 }}>
        <GestureDetector gesture={gesture}>
          <ReanimatedCamera
            style={{ flex: 1 }}
            device={device}
            isActive
            animatedProps={animatedProps}
            resizeMode="cover"
            ref={camera}
            photoQualityBalance="balanced"
            photo
          />
        </GestureDetector>
      </View>

      <View style={{ flex: 1 }}>
        {/*TOP SECTION*/}
        <View style={{ justifyContent: 'center', marginTop: 20 }}>
          <Pressable
            onPress={pickImage}
            style={{
              alignSelf: 'flex-end',
              marginEnd: 10,
              borderWidth: 1,
              padding: 10,
              borderRadius: 15,
              borderColor: '#00ACAC',
            }}>
            <Ionicons name="images" size={24} color="#00ACAC" />
          </Pressable>
        </View>

        {/*BOTTOM SECTION*/}
        <View>
          <TouchableOpacity
            onPress={takePicture}
            style={{
              alignSelf: 'center',
              borderRadius: 90,
              width: 80,
              height: 80,
              borderColor: '#00ACAC',
              borderWidth: 4,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: '#00ACAC',
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
