import { MaterialCommunityIcons } from '@expo/vector-icons';
import auth, { signOut } from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import FunctionTiedButton from '~/components/FunctionTiedButton';
import LoadingAnimation from '~/components/LoadingAnimation';
import { UserAccount } from '~/types/users/account';

export default function SignIn() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // Function to toggle the password visibility state
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const resetSignIn = () => {
    setEmail('');
    setPassword('');
  };

  const loginCall = async () => {
    try {
      // Regular expression to validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (email.trim() === '' || password.trim() === '') {
        alert('You have missed out on either your email or password!');
      } else if (!emailRegex.test(email.trim())) {
        alert('Please enter a valid email address!');
      } else {
        // Call sign-in function with email and password
        await auth().signInWithEmailAndPassword(email, password);
       
      }
    } catch (e: any) {
      const err = e as FirebaseError;
      resetSignIn();
      alert(`Either you have provided the wrong credentials or the account doesn't exist: ${err}`);
    } finally {
      setLoading(false);
    }



  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingAnimation />
      </View>
    );
  } else {
    return (
      <View style={styles.pageContainer}>
        {/* Form container*/}
        <View style={styles.formContainer}>
          {/* -------------- HEADER ------------- */}
          <View style={styles.logoContainer}>
            <Image source={require('assets/icon.png')} style={{ width: 70, height: 70 }} />
          </View>

          <Text style={{ fontFamily: 'Poppins-ExtraBold', fontSize: 24 }}>Hello Again!</Text>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 12,
              marginBottom: 20,
              color: '#8E8E8E',
            }}>
            Log in to your account
          </Text>
          <View style={styles.inputSection}>
            <View
              style={{
                backgroundColor: '#F0F0F0',
                paddingVertical: 12,
                paddingHorizontal: 25,
                width: '90%',
                borderRadius: 50,
              }}>
              <Text style={{ fontFamily: 'Poppins-Medium' }}>Name</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={styles.inputBox}
                inputMode="email"
              />
            </View>

            <View
              style={{
                backgroundColor: '#F0F0F0',
                paddingVertical: 12,
                paddingHorizontal: 25,
                width: '90%',
                borderRadius: 50,
              }}>
              <Text style={{ fontFamily: 'Poppins-Medium' }}>Password</Text>
              <TextInput
                placeholder="Enter your Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                style={styles.inputBox}
                secureTextEntry={!showPassword}
              />

              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#aaa"
                style={{ position: 'absolute', bottom: 25, right: 25 }}
                onPress={toggleShowPassword}
              />
            </View>
          </View>
          {/* ----------------- INPUT SECTION ------------- */}

          {/* ----------------- ACTION BUTTONS  ------------- */}
          <FunctionTiedButton
            buttonStyle={styles.buttonBox}
            onPress={loginCall}
            textStyle={styles.buttonText}
            title="Login"
          />


        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pageContainer: {
    width: '100%',
    height: '100%',
    gap: 20,
  },

  formContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  logoContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12%',
  },

  inputSection: {
    gap: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },

  inputBox: {
    width: '100%',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#A3A2A2',
  },

  forgetPassword: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },

  buttonBox: {
    backgroundColor: '#22CBCB',
    width: '80%',
    borderRadius: 30,
    marginTop: 40,
  },

  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: 'white',
    padding: 10,
    textAlign: 'center',
  },
});
