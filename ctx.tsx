import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { UserAccount } from './types/users/account';
import { UserProfile } from './types/users/profile';

// Define the context value structure
interface UserProfileContextValue {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  loading: boolean;
}
interface UserAccountContextValue {
  account: UserAccount | null;
  setAccount: (account: UserAccount) => void;
  loading: boolean;
}

// Create the context with a default value of null
const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);
const UserAccountContext = createContext<UserAccountContextValue | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
    setLoading(true);

    if (user) {
      // if (!user?.emailVerified) {
      //   auth().signOut();
      //   setLoading(false);
      //   alert('Please verify your profile before joining us on the app!');
      //   return null;
      // }

      

      try {
        const documentSnapshot = await firestore().collection('profiles').doc(user?.uid).get(); // Use get() for a one-time read

        if (documentSnapshot.exists) {
          // Profile exists
          const userProfile = documentSnapshot.data() as UserProfile;
          setProfile(userProfile);
        } else {
          // Profile does not exist
          alert(
            "Hi, we see it's your first time here! Please create a profile before using our services."
          );
          router.replace('/(profileCreation)/simpleInformation');
          return null;
        }
      } catch (error) {
        console.error('Error checking user profile: ', error);
        throw error;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const UserAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
    setLoading(true);

    if (user) {

      const userAccountDoc = await firestore().collection('accounts').doc(user?.uid).get();
      const accountData = userAccountDoc.data() as UserAccount;
      console.log(user.uid)
      console.log(accountData);
      if (accountData.role !== 'user')
      {
        auth().signOut().then(()=>alert("Not authorised! Please Use the web instead"))
      }


      else if (!(user.emailVerified)) {
        auth().signOut();
        setLoading(false);
        alert('Please verify your profile before joining us on the app!');
        return null;
      }

  
    

      try {
        const documentSnapshot = await firestore().collection('accounts').doc(user?.uid).get(); // Use get() for a one-time read

        if (documentSnapshot.exists) {
          // Account exists
          const userAccount = documentSnapshot.data() as UserAccount;
          setAccount(userAccount);
        } else {
          router.replace('/');
          return null;
        }
      } catch (error) {
        console.error('Error checking user account: ', error);
        throw error;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <UserAccountContext.Provider value={{ account, setAccount, loading }}>
      {children}
    </UserAccountContext.Provider>
  );
};

// Custom hook to use the UserProfileContext
export const useUserProfile = (): UserProfileContextValue => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const useUserAccount = (): UserAccountContextValue => {
  const context = useContext(UserAccountContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
