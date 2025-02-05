import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DisplayedReviews, NutritionistAccount, nutritionistProfile } from '~/types/common/nutritionists';
import firestore from '@react-native-firebase/firestore';
import LoadingAnimation from '~/components/LoadingAnimation';
import Stars from '~/components/Stars';
import FunctionTiedButton from '~/components/FunctionTiedButton';
import { FontAwesome } from '@expo/vector-icons';
import {  useUserAccount, useUserProfile } from '~/ctx';
import { currentUser } from '~/utils';
import auth from '@react-native-firebase/auth';

export default function NutritionistDetail() {

    const { id } = useLocalSearchParams();

    const [nutritionistInfo,setNutritionistInfo] = useState<NutritionistAccount|null>(null);
    const [displayReviews,setDisplayReviews] = useState<DisplayedReviews[]|null>([]);
    const [loading,setLoading] = useState(false);
    const {profile} = useUserProfile();
    const {account} = useUserAccount()

    const fetchData = async ()=>{
        setLoading(true);
        try{

            const documentId = Array.isArray(id) ? id[0] : id;
            const [accountSnapshot, profileSnapshot, reviewsSnapshot] = await Promise.all([
                firestore().collection("accounts").doc(documentId).get(),
                firestore().collection("accounts").doc(documentId).collection("profile").doc("profile_info").get(),
                firestore().collection("accounts").doc(documentId).collection("user_reviews").get(),
              ]);

                // Merge account and profile data
                if (accountSnapshot.exists && profileSnapshot.exists) {
                    const accountData = accountSnapshot.data();
                    const profileData = profileSnapshot.data();
                
                    // Ensure the correct structure for NutritionistAccount
                    setNutritionistInfo({
                      id: documentId,
                      email: accountData?.email ?? "",
                      name: accountData?.name ?? "",
                      role: accountData?.role ?? "",
                      profile: profileData as nutritionistProfile, // Ensuring correct type
                    });
                  }

                // Map reviews
                const reviews = reviewsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }) as DisplayedReviews);

                setDisplayReviews(reviews);
        }
        catch(err)
        {
            console.log(err);
        }

        setLoading(false);
    };

    const sendRequest = async () => {
        setLoading(true);
        const documentId = Array.isArray(id) ? id[0] : id;
        const userNowUID = auth().currentUser?.uid
       
        try {
          if (userNowUID && profile) {
            const requestDocRef = firestore()
              .collection("accounts")
              .doc(documentId)
              .collection("client_requests")
              .doc(userNowUID)
              .collection("profile")
              .doc("profile_info");

              const userAccountRef = firestore()
              .collection("accounts")
              .doc(documentId)
              .collection("client_requests")
              .doc(userNowUID)
             



              const personalRef = firestore()
              .collection("accounts")
              .doc(userNowUID)
              .collection("tailored_advice")
              .doc(nutritionistInfo?.id)
      
            // Check if the document already exists
            const requestSnapshot = await requestDocRef.get();
            console.log(requestSnapshot);
            if (requestSnapshot.exists) {
              alert("You have already sent a request to this nutritionist.");
            } else {
              // If it doesn't exist, send the request
              await requestDocRef.set(profile);
              if (account)
              {
                await userAccountRef.set(account);
              }
              await personalRef.set({
                pendingRequest:true,
                ...nutritionistInfo,
              })

              alert(`Request for Advice sent to ${nutritionistInfo?.profile.title}`);
            }
          }
        } catch (err) {
          console.log("Error sending request:", err);
          alert("Failed to send advice request.");
        }
      
        setLoading(false);
        router.navigate("/(requestAdvice)/viewNutritionists")
      };
      

    useEffect(()=>{
        fetchData();
    },[])

 

  return (
    <ScrollView>
    
       {loading?
        <LoadingAnimation/>:

        <View style={styles.profileContainer}>
            <Image source={{uri:nutritionistInfo?.profile.avatar}} style={styles.avatar}/>
            <Text style={styles.title}>{nutritionistInfo?.profile.title}</Text>

            <Text style={{marginVertical:20,marginBottom:5,fontSize:17,fontWeight:"semibold"}}>Specializes in:</Text>
            <View style={{flexDirection:"row",gap:10,flexWrap:"wrap",marginTop:12,paddingStart:25,marginBottom:25}}>
                {nutritionistInfo?.profile?.profileSpec?.map((spec,index)=>(
                    <View style={styles.pills} key={index}>               
                    {spec.variation?
                      <Text style={styles.pillText}>{spec.variation}</Text>:
                      <Text style={styles.pillText}>{spec.name}</Text>
                     }
                    </View>
                    )) 
                }
            </View>
            <Text style={{alignSelf:"flex-start",marginBottom:18,fontSize:17,fontWeight:"bold"}}>All Reviews</Text>

            {/* NOTE - CONVERT TO COMPONENT */}
            {displayReviews?.map((rev,index)=>(
                <View style={{flex:1,padding:20,width:"100%",marginBottom:15,backgroundColor:"white"}} key={index}>
                    <View style={{flexDirection:"row",gap:20,borderRadius:10,alignItems:"center"}}>
                        <Image source={{uri:rev?.image}} style={styles.reviewAvatar}/>
                        <Text style={{fontSize:16}}>{rev.name}</Text>
                 
                    </View>

                    <View style={{gap:10,marginTop:18,marginBottom:20}}>
                    <Text style={{fontSize:16,fontWeight:"bold"}}>Gave {rev.score} Stars</Text>
                    <Stars rating={rev.score}/>
                    </View>
                   
                    {rev.reasons.map((reason,index)=>(
                        <View key={index} style={{padding:14,backgroundColor:"#6B7FD6",marginVertical:8,borderRadius:50,paddingHorizontal:18}}>
                            <Text style={{color:"white"}}>{reason}</Text>
                        </View>
                    ))}
                </View>
            ))}
        
            <Pressable style={styles.sendButton} onPress={()=>sendRequest()}>
                <Text style={styles.sendButtonText}>Send Request</Text>
                <FontAwesome name="send-o" size={18} color="white" />
            </Pressable>
        
        </View>
        }

    </ScrollView>
  )
}

const styles = StyleSheet.create({

    profileContainer:{
        flex:1,
        alignItems:"center",
        padding:20
    },
    avatar:{
        borderRadius:90,
        width:120,
        height:120,
        borderWidth:1,
        borderColor:"#DEDEDE"
    },
    title:{
        fontSize:22,
        marginTop:10,
        fontWeight:"bold",
    },
    pills:{
        backgroundColor:"#00ACAC",
        padding:10,
        borderRadius:30,
    },

    pillText:{
        color:"white"
    },

    reviewAvatar:{
        width:50,
        height:50,
        borderRadius:80
    },

    sendButton:{
        backgroundColor:"#00ACAC",
        padding:15,
        flex:1,
        width:"100%",
        justifyContent:"center",
        marginVertical:15,
        flexDirection:"row",
        borderRadius:30,
        alignItems:"center",
        gap:8
    },
    sendButtonText:{
        color:"white",
        fontSize:16,
        fontWeight:"bold"
    }
})