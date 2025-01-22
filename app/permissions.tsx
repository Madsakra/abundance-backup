import { Ionicons } from '@expo/vector-icons';
import * as ExpoMediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';

export default function PermissionsScreen() {
  const [CameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>('not-determined');

  const [mediaLibraryPermission, requestMediaLibraryPermission] = ExpoMediaLibrary.usePermissions();

  const requestCameraPermission = async () => {
    const permission = await Camera.requestCameraPermission();
    setCameraPermissionStatus(permission);
  };

  const handleContinue = () => {
    if (CameraPermissionStatus === 'granted' && mediaLibraryPermission?.granted) {
      router.replace('/');
    } else {
      alert('Please enable the permission before leaving!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />

      <Text style={styles.subtitle}>
        Abundance needs access to a few permissions in order to work properly
      </Text>

      <View style={styles.row}>
        <Ionicons name="lock-closed-outline" size={26} color="orange" />
        <Text style={styles.footNote}>Required</Text>
      </View>

      <View style={styles.spacer} />
      <View style={[styles.permissionContainer, styles.row]}>
        <Ionicons name="camera-outline" size={26} color="white" />
        <View>
          <Text>Camera</Text>
          <Text>Used for taking photoes</Text>
        </View>

        <Switch
          trackColor={{ true: 'orange' }}
          value={CameraPermissionStatus === 'granted'}
          onChange={requestCameraPermission}
        />
      </View>

      <View style={styles.spacer} />
      <View style={[styles.permissionContainer, styles.row]}>
        <Ionicons name="library-outline" size={26} color="white" />
        <View>
          <Text>Image Library</Text>
          <Text>Used for saving, viewing photos</Text>
        </View>

        <Switch
          trackColor={{ true: 'orange' }}
          value={mediaLibraryPermission?.granted}
          // @ts-ignore
          onChange={async () => await requestMediaLibraryPermission()}
        />
      </View>

      <View style={styles.spacer} />
      <View style={styles.spacer} />
      <View style={styles.spacer} />

      <TouchableOpacity style={[styles.row, styles.continueButton]} onPress={handleContinue}>
        <Ionicons name="arrow-forward-outline" size={26} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  subtitle: {
    textAlign: 'center',
  },

  footNote: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  spacer: {
    marginVertical: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },

  permissionContainer: {
    backgroundColor: '#8A8A8A',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  permissionText: {
    marginLeft: 10,
    flexShrink: 1,
  },
  continueButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 50,
    alignSelf: 'center',
  },
});
