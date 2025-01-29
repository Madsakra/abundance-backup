import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { UserAccount, UserMembership } from './types/users/account';
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
  membership: UserMembership | null;
  setMembership: (newMemb: UserMembership) => void;
}

// Create the context with a default value of null
const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);
const UserAccountContext = createContext<UserAccountContextValue | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const docRef = firestore()
        .collection('accounts')
        .doc(user.uid)
        .collection('profile')
        .doc('profile_info');

      // 🔥 Use `.onSnapshot()` to listen for real-time updates
      const unsubscribeSnapshot = docRef.onSnapshot(
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            setProfile(documentSnapshot.data() as UserProfile);
          } else {
            alert('Welcome! Please create a profile before using our services.');
            router.replace('/(profileCreation)/simpleInformation');
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        }
      );

      return unsubscribeSnapshot; // Unsubscribe when component unmounts
    });

    return unsubscribe; // Unsubscribe auth listener on unmount
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const UserAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authSubscriber = auth().onAuthStateChanged((user) => {
      if (!user) {
        setAccount(null);
        setMembership(null);
        setLoading(false);
        return;
      }

      const accountRef = firestore().collection('accounts').doc(user.uid);

      // 🔥 Listen for real-time account updates
      const unsubscribeAccount = accountRef.onSnapshot(
        async (accountSnapshot) => {
          if (!accountSnapshot.exists) {
            router.replace('/');
            return;
          }

          const userAccount = accountSnapshot.data() as UserAccount;

          if (userAccount.role !== 'user') {
            await auth().signOut();
            alert('Not authorized! Please use the web instead.');
            return;
          }

          if (!user.emailVerified) {
            await auth().signOut();
            alert('Please verify your email before accessing the app.');
            return;
          }

          setAccount(userAccount);

          // Listen for real-time membership updates
          const membershipRef = firestore().collection(`users/${user.uid}/membership`);
          const unsubscribeMembership = membershipRef.onSnapshot((membershipSnapshot) => {
            if (!membershipSnapshot.empty) {
              const memberships: UserMembership[] = membershipSnapshot.docs.map((doc) => ({
                membershipID: doc.id,
                ...doc.data(),
              })) as UserMembership[];
              setMembership(memberships[0]); // Set first membership
            }
          });

          return () => unsubscribeMembership(); // Cleanup membership listener
        },
        (error) => {
          console.error('Error fetching user account:', error);
        }
      );

      return () => unsubscribeAccount(); // Cleanup account listener
    });

    return () => authSubscriber(); // Cleanup auth listener
  }, []);

  return (
    <UserAccountContext.Provider
      value={{ account, setAccount, loading, membership, setMembership }}>
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
