import { ActivityIndicator, Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MembershipTier } from "~/types/common/membership";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useState } from "react";
import WebView from "react-native-webview";

type MembershipBoxProps = {
    tier:MembershipTier;
}







export default function MembershipBox({tier}:MembershipBoxProps) {

    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [showWebView, setShowWebView] = useState(false);
    const [loading,setLoading] = useState(false);
    const userNowUID = auth().currentUser?.uid;

      
    const newData = {
        price: tier.id,
        success_url: "https://abundance-3f9ab.web.app/",
        cancel_url: "https://abundance-3f9ab.web.app/",
      };
    
      const startCheckout = async () => {
        if (!userNowUID) return;
        setLoading(true);
        try {
          // Reference "checkout_sessions" subcollection
          const checkoutSessionsRef = firestore()
            .collection("accounts")
            .doc(userNowUID)
            .collection("checkout_sessions");
    
          // Add new checkout session
          const docRef = await checkoutSessionsRef.add(newData);
    
          // Listen for changes in the checkout session
          const unsubscribeCheckout = docRef.onSnapshot(async (snap) => {
            const data = snap.data();
    
            if (data?.url) {
              setCheckoutUrl(data.url);
              setLoading(false);
              setShowWebView(true); // Show WebView when URL is ready
            }
          });
    
          // Listen for subscription changes
          const subscriptionsRef = firestore()
            .collection("accounts")
            .doc(userNowUID)
            .collection("subscriptions");
    
          const unsubscribeSubscription = subscriptionsRef.onSnapshot(async (snapshot) => {
            if (!snapshot.empty) {
              console.log("Subscription detected! Closing WebView...");
              setShowWebView(false); // Hide WebView when subscription is confirmed
              unsubscribeSubscription(); // Stop listening
              unsubscribeCheckout(); // Stop listening to checkout session
            }
          });
    
          return () => {
            unsubscribeCheckout();
            unsubscribeSubscription();
          };
        } catch (error) {
          console.error("Error adding document: ", error);
          alert("An error occurred while creating the checkout session.");
        }
      };

      


  return (
          <View style={styles.container} key={tier.id}>
                <View>
                <Text style={styles.tierDescription}>{tier.description}</Text>
                <Text style={styles.price}>${tier.unit_amount/100} / {tier.interval}</Text>
                </View>
                <Pressable style={styles.subscribeButton} onPress={startCheckout}>
                    <Text style={styles.buttonText}>Subscribe</Text>
                </Pressable>
 
                    {/* WebView Modal */}
                    {showWebView && checkoutUrl && (
                      <Modal visible={showWebView} animationType="slide">
                        <WebView
                          source={{ uri: checkoutUrl }}
                          onNavigationStateChange={(navState) => {
                            if (navState.url === "https://abundance-3f9ab.web.app/") {
                              console.log("Payment successful! Closing WebView...");
                              setShowWebView(false); // Hide WebView when success URL is reached
                            }
                          }}
                        />
                      </Modal>
                    )}


                  {
                  loading &&
                  <Modal>
                    <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
                    <ActivityIndicator size={"large"}/>                  
                    </View>
                  </Modal>
                }
          </View>
  )
}

const styles = StyleSheet.create({

    container:{
            backgroundColor:"white",
            padding:20,
            marginVertical:10,
            flexDirection:"row",
            alignItems:"center",
            justifyContent:"space-between",
            borderRadius:10
    },

    subscribeButton:{
        padding:12,
        backgroundColor:"#00ACAC",
        marginVertical:10,
        borderRadius:12,
    },

    buttonText:{
        fontSize:16,
        textAlign:"center",
        color:"white",  
    },

    tierDescription:{
      fontSize:17,
      fontWeight:"bold",
      marginBottom:5
    },
    
    price:{
      fontSize:16,
      fontWeight:"medium"
    }

})