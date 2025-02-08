import { ActivityIndicator, Dimensions, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { MembershipTier, StripeSubscription } from '~/types/common/membership';
import firestore, { getDocs, Timestamp } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MembershipBox from '~/components/MembershipBox';

import WebView from 'react-native-webview';
import { firebase } from '@react-native-firebase/functions';
import BackButton from '~/components/BackButton';
import { router } from 'expo-router';
import { Entypo } from '@expo/vector-icons';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function Membership() {
  const [loading,setLoading] = useState(false);
  const [membershipTiers,setMembershiptiers] = useState<MembershipTier []| null>(null); 
  const [firstTime,setFirstTime] = useState(false);
  const [currentMembershipTier,setCurrentMembershipTier] = useState<StripeSubscription|null>(null)
  const userNowUID = auth().currentUser?.uid;
  const [customerURL,setCustomerURL] = useState("");
  const [showWebView, setShowWebView] = useState(false);

  const checkUserMembership = () => {
    if (!userNowUID) return;
  
    // Reference the "subscriptions" collection for the user
    const subscriptionsRef = firestore()
      .collection("accounts")
      .doc(userNowUID)
      .collection("subscriptions");
  
    // Listen for real-time updates
    const unsubscribe = subscriptionsRef.onSnapshot(async (snapshot) => {
      if (!snapshot.empty) {
        setFirstTime(false);
        setCurrentMembershipTier(snapshot.docs[0].data() as StripeSubscription)
        
      } else {
        setFirstTime(true);
        fetchMemberships();
      }
    });
  
    // Cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  };
  
  // Call inside `useEffect` to ensure it runs when the component mounts
  useEffect(() => {
    const unsubscribe = checkUserMembership();
  
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const manageMembership = async () => {
    setLoading(true);
    const functionRef = firebase.app().functions('asia-southeast2').httpsCallable(
      'ext-firestore-stripe-payments-createPortalLink'
    );
  
    try {
      const response = await functionRef({
        customerId: userNowUID,
        returnUrl: 'https://abundance-3f9ab.web.app', // Use deep linking or a valid URL
      });
  
      const dataWithUrl = response.data as { url: string };
      
      if (dataWithUrl.url) {
        setCustomerURL(dataWithUrl.url);  // First, set the URL
        setTimeout(() => setShowWebView(true), 100); // Small delay before opening WebView
      }
    } catch (error) {
      console.error("Error fetching portal link:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchMemberships = async()=>{
    const collectionRef = await firestore()
    .collection("membership")
    .doc("prod_RgC8KOaMNtX5PL")
    .collection("prices");


    // Query Firestore, ordering by "unit_amount"
    const snapshot = await collectionRef.orderBy("unit_amount", "asc").get();
    // Map Firestore documents to structured objects
    const tiersData = snapshot.docs.map((doc) => ({
      id: doc.id,
      description: doc.data().description || "",
      unit_amount: doc.data().unit_amount || 0,
      currency: doc.data().currency || "USD",
      interval: doc.data().interval || "monthly",
    }));
    // Update state (assuming you have state for membership tiers)
    setMembershiptiers(tiersData);
  
  }





  useEffect(() => {
    console.log(customerURL);
    if (customerURL) {
      setShowWebView(true);
    }
  }, [customerURL]); // Watches for URL changes


  return (
    <ScrollView>
      

 
              {
                  loading &&
                  <Modal>
                    <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
                    <ActivityIndicator size={"large"}/>                  
                    </View>
                  </Modal>
                }

      {firstTime && !showWebView?
          <View style={{flex:1,padding:30}}>
          <View style={{padding:25}}>
          <Pressable onPress={()=>router.navigate("/(userScreens)/(settings)/settings")}>
                <Entypo name="chevron-thin-left" size={20} color="black" />
        </Pressable>
      </View>
        <View>
          <Text style={styles.header}>Upgrade to premium tier</Text>
          <Text style={styles.subHeader}>Don't limit yourself, give yourself an upgrade!</Text>
        </View>

        {membershipTiers?.map((tier)=>{
          if (tier.unit_amount!==0)
          {
            return (
            <MembershipBox 
            tier={tier} 
            key={tier.id} 
            setCustomerURL={setCustomerURL} 
            setLoading={setLoading}
            showWebView={showWebView}/>)
          }
        })}
      </View>:
        
      <View style={styles.manageContainer}>

          {(!showWebView) &&
          <View>
                  <View style={{padding:25}}>
                  <Pressable onPress={()=>router.navigate("/(userScreens)/(settings)/settings")}>
                        <Entypo name="chevron-thin-left" size={20} color="black" />
                </Pressable>
                  </View> 
          <Text style={{marginVertical:20,fontSize:20,paddingStart:20,fontWeight:"bold",color:"#00ACAC"}}>Manage your membership</Text>
          <View style={{backgroundColor:"white",padding:20,marginBottom:20,minHeight:300}}>
            <Text style={{fontSize:18,fontWeight:"bold"}}>Membership Status: {currentMembershipTier?.status}</Text>
            <Text style={{fontSize:16,marginVertical:5}}>
              Period: {currentMembershipTier?.current_period_end instanceof Timestamp 
                ? currentMembershipTier.current_period_start.toDate().toLocaleDateString() 
                : "N/A"} to {currentMembershipTier?.current_period_end instanceof Timestamp 
                ? currentMembershipTier.current_period_end.toDate().toLocaleDateString() 
                : "N/A"}
            </Text>


            {currentMembershipTier?.cancel_at_period_end &&
            <Text style={{marginVertical:20}}>Membership cancelled on {currentMembershipTier?.canceled_at instanceof Timestamp ?
            currentMembershipTier?.canceled_at.toDate().toLocaleDateString() 
                : "N/A"
            }</Text>
            
            }

              <Text style={{marginVertical:15,marginBottom:25,fontSize:15}}>For More Information,
                 please click on the button below to view full details and manage your subscription.</Text>
              <Pressable style={{backgroundColor:"#00ACAC",padding:10,borderRadius:5}} onPress={manageMembership}>
              <Text style={{textAlign:"center",color:"white",padding:10}}>Manage</Text>
            </Pressable>

          </View>
        </View>          
          
          }


          {/* WebView Modal:ANDROID */}
          {Platform.OS === "android" && showWebView && customerURL && (
        <Modal visible={showWebView} animationType="slide">
          <WebView
          style={{width:windowWidth,height:windowHeight}}
            source={{ uri: customerURL }}
            onNavigationStateChange={(navState) => {
              if (navState.url === "https://abundance-3f9ab.web.app/") {
                console.log("Going back...");
                setCustomerURL("");
                setShowWebView(false); // Hide WebView when success URL is reached
              }
            }}
          />
        </Modal>
      )}
      </View>
      }
    {Platform.OS === "ios" && showWebView && customerURL && (
    
    <WebView
      style={styles.iosWebView} // Ensures it takes the full screen
      source={{ uri: customerURL }}
      onNavigationStateChange={(navState) => {
        if (navState.url === "https://abundance-3f9ab.web.app/") {
          console.log("Going back...");
          setCustomerURL("");
          setShowWebView(false); // Hide WebView when success URL is reached
        }
      }}
    />

  )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header:{
    fontSize:22,
    marginVertical:8
  },

  subHeader:{
    fontSize:16,
    color:"#6E6E6E",
    marginVertical:5,
    marginBottom:20
  },
  manageContainer:{
    justifyContent:"center"
  },

  iosWebView:{
    position: "fixed",
    height: windowHeight, // Keep your original height

  }
})