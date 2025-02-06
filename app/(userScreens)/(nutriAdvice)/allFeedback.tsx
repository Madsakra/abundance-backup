import React, { useEffect, useState } from 'react'
import {ScrollView, StyleSheet, Text, View } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore, { onSnapshot } from '@react-native-firebase/firestore';
import {  StatusFeedbackDisplay } from '~/types/common/nutritionists';
import { FlashList } from '@shopify/flash-list';
import AdviceStatus from '~/components/cards/advice-status';




export default function AllFeedback() {


  const [advices,setAdvices] = useState<StatusFeedbackDisplay[]>([])


  useEffect(()=>{

    const userNowUID = auth().currentUser?.uid;
    if (!userNowUID) return;

    const userDocRef = firestore().collection("accounts").doc(userNowUID).collection("tailored_advice")
  

    const unsubscribe = onSnapshot(userDocRef,(querySnapshot)=>{
      const adviceList:StatusFeedbackDisplay[] = [];
      querySnapshot.forEach((doc)=>{
        const data = doc.data();
        adviceList.push(data as StatusFeedbackDisplay)
      })

      setAdvices(adviceList);

    })

    return ()=>unsubscribe();
  },[])


  return (
    <ScrollView>
        <View style={{flex:1,padding:25}}>
          <Text style={styles.headerText}>View Your Requests Status</Text>
        </View>
        <FlashList
        data={advices}
        renderItem={({ item }) => (
          <AdviceStatus
          item={item}
          />
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
})