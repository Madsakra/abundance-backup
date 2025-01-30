import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const BarcodeScanner = () => {
  const device = useCameraDevice('back'); // Use the back camera
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    })();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'], // Supported barcode formats
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        setScannedCode(codes[0].value as string);
      }
    },
  });

  if (!device) return <Text>No Camera Device Found</Text>;
  if (!hasPermission) return <Text>No Camera Permission</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        codeScanner={codeScanner} // Enable barcode scanner
      />
      {scannedCode && <Text style={styles.codeText}>Scanned Code: {scannedCode}</Text>}
    </View>
  );
};

export default BarcodeScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: 10,
    borderRadius: 5,
  },
});
