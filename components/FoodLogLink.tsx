import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageProps,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type FoodLogLinkType = {
  index: number;
  image: ImageProps;
  routeName: string;
};

export default function FoodLogLink({ index, image, routeName }: FoodLogLinkType) {
  const [visible, setVisible] = useState(false); // Control modal visibility

  return (
    <View>
      <Pressable
        style={{ padding: 15, backgroundColor: '#f9f9f9', borderRadius: 20 }}
        key={index}
        onPress={() => setVisible(true)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Image source={image} style={{ width: 50, height: 50 }} />
          <Text style={{ fontFamily: 'Poppins-Regular' }}>{routeName}</Text>
        </View>
      </Pressable>

      {/* Modal */}
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>
              Select the following option to identify your food calories
            </Text>

            {/* Option: Food With Barcode */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                console.log('Food with Barcode');
                setVisible(false); // Close the modal
              }}>
              <Image source={require('assets/routeImages/barcode.jpg')} style={styles.icon} />
              <Text style={styles.optionText}>Food With Barcode</Text>
            </TouchableOpacity>

            {/* Option: Cooked Meal */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                router.replace('/calories/cookedMeals');
                setVisible(false); // Close the modal
              }}>
              <Image source={require('assets/routeImages/cooked_food.jpg')} style={styles.icon} />
              <Text style={styles.optionText}>Cooked Meal</Text>
            </TouchableOpacity>

            {/* Button to close modal */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  openButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    width: '100%',
    gap: 5,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  optionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF6347',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
