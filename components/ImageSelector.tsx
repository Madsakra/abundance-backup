import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

type ImageSelectorProps = {
  pickImage: () => void;
};

export default function ImageSelector({ pickImage }: ImageSelectorProps) {
  return (
    <View style={styles.imagePicker}>
      <FontAwesome6 name="images" size={20} color="black" />
    </View>
  );
}

const styles = StyleSheet.create({
  imagePicker: {
    backgroundColor: 'white',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    borderWidth: 2,
    opacity: 0.8,
  },
});
