import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CustomModalProps = {
  showModal: boolean;
  handleSave: () => void;
  handleClose: () => void;
  themeColor: string;
  message: string;
  successMessage: string;
};

export default function CustomModal({
  showModal,
  handleClose,
  handleSave,
  themeColor,
  message,
  successMessage,
}: CustomModalProps) {
  const [success, setSuccess] = useState(false);

  if (!success) {
    return (
      <Modal transparent visible={showModal} animationType="fade" onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={[styles.message, { color: themeColor }]}>{message}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.noButton} onPress={handleClose}>
                <Text style={styles.noButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: themeColor }]}
                onPress={() => setSuccess(true)}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (success) {
    return (
      <Modal transparent visible={showModal} animationType="fade" onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={[styles.message, { color: themeColor }]}>{successMessage}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: themeColor }]}
                onPress={handleSave}>
                <Text style={styles.saveButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  svgContainer: {
    borderRadius: 50,
    height: 100,
    width: 100,
    borderWidth: 2,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  noButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  noButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,

    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Poppins-Bold',
    color: 'white',
    fontSize: 16,
  },
});
