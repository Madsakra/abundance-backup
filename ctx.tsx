import auth, { FirebaseAuthTypes, getAuth, onAuthStateChanged, signOut } from '@react-native-firebase/auth';
import firestore, { collection, doc, getFirestore, onSnapshot } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { UserAccount, UserMembership } from './types/users/account';
import { UserProfile } from './types/users/profile';
import { StripeSubscription } from './types/common/membership';

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
  membershipTier: StripeSubscription| null;
}

// Create the context with a default value of null
const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);
const UserAccountContext = createContext<UserAccountContextValue | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user:FirebaseAuthTypes.User|null) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const docRef = doc(db, "accounts", user.uid, "profile", "profile_info");

      // 🔥 Use `onSnapshot()` for real-time updates
      const unsubscribeSnapshot = onSnapshot(
        docRef,
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            setProfile(documentSnapshot.data() as UserProfile);
          } else {
            alert("Welcome! Please create a profile before using our services.");
            router.replace("/(profileCreation)/simpleInformation");
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false);
        }
      );

      return unsubscribeSnapshot; // Unsubscribe when component unmounts
    });

    return unsubscribeAuth; // Unsubscribe auth listener on unmount
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const UserAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [membershipTier,setCurrentMembershipTier] = useState<StripeSubscription|null>(null)
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user:FirebaseAuthTypes.User) => {
      if (!user) {
        setAccount(null);
        setCurrentMembershipTier(null);
        setLoading(false);
        return;
      }

      const accountRef = doc(db, "accounts", user.uid);

      // 🔥 Listen for real-time account updates
      const unsubscribeAccount = onSnapshot(
        accountRef,
        async (accountSnapshot) => {
          if (!accountSnapshot.exists) {
            router.replace("/");
            return;
          }

          const userAccount = accountSnapshot.data() as UserAccount;


          setAccount(userAccount);


          if (userAccount.role !== "user") {
            await signOut(auth);
            alert("Not authorized! Please use the web instead.");
            return;
          }

          if (!user.emailVerified) {
            await signOut(auth);
            alert("Please verify your email before accessing the app.");
            return;
          }

            // Reference the "subscriptions" collection for the user
              const subscriptionsRef = firestore().collection("accounts").doc(user.uid).collection("subscriptions");
                // Listen for real-time updates
                const unsubscribeMembership = subscriptionsRef.onSnapshot(async (snapshot) => {
                  if (!snapshot.empty) {
                    setCurrentMembershipTier(snapshot.docs[0].data() as StripeSubscription)
                  } 
                });
              return () => unsubscribeMembership(); // Cleanup membership listener
  
        },
        (error) => {
          console.error("Error fetching user account:", error);
        }
      );
      return () => unsubscribeAccount(); // Cleanup account listener
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  return (
    <UserAccountContext.Provider
      value={{ account, setAccount, loading, membershipTier }}>
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
