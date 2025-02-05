import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore, { onSnapshot } from '@react-native-firebase/firestore';
import { NutritionistAccount } from '~/types/common/nutritionists';
import { FlashList } from '@shopify/flash-list';

interface DisplayAccount {
  nutritionistInfo:NutritionistAccount,
  status:string
}


export default function AllFeedback() {


  const userNowUID = auth().currentUser?.uid;
  const [advices,setAdvices] = useState<DisplayAccount[]>([])


  useEffect(()=>{

    const userNowUID = auth().currentUser?.uid;
    if (!userNowUID) return;

    const userDocRef = firestore().collection("accounts").doc(userNowUID).collection("tailored_advice")
  

    const unsubscribe = onSnapshot(userDocRef,(querySnapshot)=>{
      const adviceList:DisplayAccount[] = [];
      querySnapshot.forEach((doc)=>{
        const data = doc.data();
        adviceList.push(data as DisplayAccount)
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
          <View style={{padding:20,backgroundColor:"white"}}>
            <View style={{flexDirection:"row",gap:20,alignItems:"center",flexWrap:"wrap"}}>
            <Image source={{uri:item.nutritionistInfo?.profile?.avatar}} style={{borderRadius:50,height:60,width:60}}/>
            <View>
            <Text>Nutritionist: {item.nutritionistInfo?.profile.title}</Text>
            {item.status==="pending" &&
            <Text style={{marginTop:5,color:"#FBA518"}}>Request Status: {item.status}</Text>            
            }
            {item.status==="complete" &&
            <Text style={{marginTop:5,color:"#77B254"}}>Request Status: {item.status}</Text>            
            }
            </View>
            </View>
            {item.status==="pending" &&
            <Pressable disabled style={{padding:15,backgroundColor:"#D9D9D9",marginTop:20,borderRadius:50}}>
              <Text style={{textAlign:"center",fontWeight:"700"}}>Working on it....</Text>
            </Pressable>
            }
            {item.status==="complete" &&
            <Pressable disabled style={{padding:15,backgroundColor:"#00ACAC",marginTop:20,borderRadius:50}}>
              <Text style={{textAlign:"center",fontWeight:"700",color:"white"}}>See Advice</Text>
            </Pressable>
            }
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
})