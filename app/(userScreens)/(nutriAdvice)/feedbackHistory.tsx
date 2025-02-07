import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import AdviceStatus from '~/components/cards/advice-status'
import { useEffect, useState } from "react";


import auth from '@react-native-firebase/auth';
import { db } from '~/utils';
import { collection } from '@react-native-firebase/firestore';
import { AdviceHistory } from '~/types/common/nutritionists';
import { Image } from 'react-native';
import { router } from 'expo-router';
import { Entypo } from '@expo/vector-icons';

export default function FeedbackHistory() {

    const [advices, setAdvices] = useState<AdviceHistory[]>([]);

    useEffect(() => {
        const userNowUID = auth().currentUser?.uid;
        if (!userNowUID) return;
      
        // Reference to "tailored_advice" collection
        const tailoredAdviceRef = collection(db,"accounts",userNowUID,"tailored_advice")
 
      
        // Listen for real-time updates
        const unsubscribe = tailoredAdviceRef.onSnapshot(async (tailoredAdviceSnapshot) => {
          const adviceList: AdviceHistory[] = [];
      
          // Fetch all advice for each nutritionist
          const fetchAdvicePromises = tailoredAdviceSnapshot.docs.map(async (nutritionistDoc) => {
            const nutritionistInfo = nutritionistDoc.data().nutritionistInfo;
            
            if (!nutritionistInfo) return; // Skip if no nutritionist info exists
      
            const adviceCollectionRef = nutritionistDoc.ref.collection("advice");
            const adviceSnapshot = await adviceCollectionRef.get(); // Get ALL advice docs
      
            adviceSnapshot.forEach((adviceDoc) => {
              const adviceData = adviceDoc.data();
          
              adviceList.push({
                id: adviceDoc.id,
                email: nutritionistInfo.email,
                name: nutritionistInfo.name,
                avatar: nutritionistInfo.profile.avatar,
                timestamp: adviceData.timestamp || null,
                title: adviceData.title,
                content: adviceData.content,
                goalAdvice: adviceData.goalAdvice,
                nutritionistID:nutritionistDoc.id
              });
            });
          });
      
          await Promise.all(fetchAdvicePromises); // Ensure all async queries complete
          setAdvices(adviceList);
        });
      
        return () => unsubscribe(); // Cleanup listener
      }, []);


      const seeNext = (adviceID:string,nutritionistID:string)=>{
            router.navigate({
                pathname: '/pastMessage',
                params: {
                    id: adviceID,
                    nutriID:nutritionistID
                }
            }
            )
         }

      
  return (
    <ScrollView>
    <View style={{flex:1,flexDirection:"row",padding:25,paddingBottom:25,justifyContent:"space-between",alignItems:"center"}}>
    <Pressable onPress={()=>router.back()}>
            <Entypo name="chevron-thin-left" size={20} color="black" />
    </Pressable>

    <Text style={{fontSize:16,fontWeight:"bold",color:"#00ACAC"}}>Your Past Feedback History</Text>
    </View>

    <FlashList
    data={advices}
    renderItem={({item})=>(
        <View key={item.id} style={styles.singleContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ marginLeft: 10 }}>
          <Text>Name: {item.name}</Text>
          <Text>Email: {item.email}</Text>
          <Text>Time of advice: {item.timestamp ? item.timestamp.toDate().toLocaleString() : "No Advice"}</Text>
          <Pressable style={styles.actionButton} onPress={()=>seeNext(item.id,item.nutritionistID)}>
            <Text style={styles.actionButtonText}>View Again</Text>
          </Pressable>
        </View>
      </View>
    )}
    estimatedItemSize={200}
    />

</ScrollView>
)
  
}
const styles = StyleSheet.create({
  headerText:{
    flex:1,
    fontSize:15,
    fontWeight:"bold"
  },

  singleContainer:{
    flexDirection: "row", 
    alignItems: "center",
     marginBottom: 10,
     padding:15,
     gap:10,
     backgroundColor:"white"
  },
  avatar:{
    width: 50, 
    height: 50, 
    borderRadius: 25 
  },

  actionButton:{
    padding:8,
    backgroundColor:"#00ACAC",
    marginTop:10,
    borderRadius:20
  },

  actionButtonText:{
    color:"white",
    fontWeight:"bold",
    textAlign:"center"
  }
})