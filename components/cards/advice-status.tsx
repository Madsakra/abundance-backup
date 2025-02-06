import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { StatusFeedbackDisplay } from '~/types/common/nutritionists'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';


type AdviceStatusProps = {
    item:StatusFeedbackDisplay
}



export default function AdviceStatus({item}:AdviceStatusProps) {

    const user = auth().currentUser;
    const [reviewd,setReviewd] = useState(false);

    const checkReview = async()=>{
        if (user)
        {
            const reviewDoc = await firestore().collection('accounts').doc(user.uid).collection('nutritionist_reviews').doc(item.nutritionistInfo.id).get();
            if (reviewDoc.exists)
            {
                setReviewd(true);
            }
        }
    };

      const seeNext = ()=>{
            router.navigate({
                pathname: '/reviewNutri',
                params: {
                    displayInfo: JSON.stringify(item),
    
                }
            }
            )
         }

         useEffect(()=>{
            checkReview();
         },[])
    
  return (
          <View style={styles.container}>
            <View style={styles.row}>
            <Image source={{uri:item.nutritionistInfo?.profile?.avatar}} style={styles.avatar}/>
            <View>
            <Text>{item.nutritionistInfo?.profile?.title || 'No Title'}</Text>
            {item.status==="complete"?
            <Text style={{marginTop:5,color:"#77B254"}}>Request Status: {item.status}</Text>:  
            <Text style={{marginTop:5,color:"#FBA518"}}>Request Status: {item.status}</Text>            
            }
            </View>
            {reviewd &&
                <Pressable onPress={seeNext}>
                    <MaterialIcons name="reviews" size={24} color="#00ACAC" style={{marginLeft:15}} />
                </Pressable>            
            }
            
            </View>
            {item.status==="complete"?
            <Pressable style={{padding:15,backgroundColor:"#00ACAC",marginTop:25,borderRadius:50}} onPress={()=>router.navigate(`/${item.nutritionistInfo.id}`)}>
                <Text style={{textAlign:"center",fontWeight:"700",color:"white"}}>See Advice</Text>
            </Pressable>:
            <Pressable disabled style={{padding:15,backgroundColor:"#D9D9D9",marginTop:20,borderRadius:50}}>
                <Text style={{textAlign:"center",fontWeight:"700"}}>Working on it....</Text>
             </Pressable>    
            }
          </View>
  )
}

const styles = StyleSheet.create({
    container:{
        padding:20,
        backgroundColor:"white",
        marginBottom:20
    },
    row:{
        flexDirection:"row",
        gap:20,
        alignItems:"center",
        flexWrap:"wrap"
    },
    avatar:{
        borderRadius:50,
        height:60,
        width:60
    }
})