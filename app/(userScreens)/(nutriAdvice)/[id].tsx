import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import firestore, { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import { AdviceInformation, StatusFeedbackDisplay } from '~/types/common/nutritionists';
import auth from '@react-native-firebase/auth';
import LoadingAnimation from '~/components/LoadingAnimation';
import { Entypo } from '@expo/vector-icons';
import { db } from '~/utils';

export default function AdviceMessage() {

const { id } = useLocalSearchParams();
const documentId = Array.isArray(id) ? id[0] : id;
const currentUID = auth().currentUser?.uid;

const [displayInfo,setDisplayInfo] = useState<StatusFeedbackDisplay|null>(null);
const [advice,setAdvice] = useState<AdviceInformation|null>(null);


const fetchData = () => {
    try {
      // Reference to the "tailored_advice" document
      const displayInfoRef = doc(db, "accounts", currentUID!, "tailored_advice", documentId);
  
      // Reference to the "advice" subcollection
      const adviceCollectionRef = collection(db, "accounts", currentUID!, "tailored_advice", documentId, "advice");
  
      // Real-time listener for "tailored_advice" document
      const unsubscribeDisplay = onSnapshot(displayInfoRef, (docSnapshot) => {
        if (docSnapshot.exists) {
          setDisplayInfo(docSnapshot.data() as StatusFeedbackDisplay);
        } else {
          console.log("No display info found");
        }
      });
  
      // Real-time listener for the latest advice document
      const latestAdviceQuery = query(adviceCollectionRef, orderBy("timestamp", "desc"), limit(1));
  
      const unsubscribeAdvice = onSnapshot(latestAdviceQuery, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const latestAdviceDoc = querySnapshot.docs[0].data() as AdviceInformation;
          setAdvice(latestAdviceDoc);
        } else {
          console.log("No advice found");
        }
      });
  
      // Cleanup function to unsubscribe when the component unmounts
      return () => {
        unsubscribeDisplay();
        unsubscribeAdvice();
      };
  
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  useEffect(() => {
    return fetchData();
  }, []);

 const seeNext = ()=>{
    router.navigate({
        pathname: '/mealPlans',
        params: {
            displayInfo: JSON.stringify(displayInfo),
            advice: JSON.stringify(advice)
        }
    }
    )
 }


  return (
    <ScrollView>
        {(advice && displayInfo)?
        <View style={styles.innerContainer}>

            <Pressable onPress={()=>router.navigate('/allFeedback')} style={{padding:20}}>
            <Entypo name="chevron-thin-left" size={20} color="black" />
            </Pressable>
            
            <View style={styles.topRow}>
                <Image source={{uri:displayInfo.nutritionistInfo.profile.avatar}} style={styles.avatar}/>
                <View>
                    <Text style={{fontSize:18}}>{displayInfo.nutritionistInfo.profile.title}</Text>
                    <Text style={{fontSize:12,marginTop:3}}>{displayInfo.nutritionistInfo.email}</Text>
                </View>
            </View>

            <View style={styles.bodyRow}>
                <Text style={styles.titleHeading}>Title:</Text>
                <Text style={styles.titleText}>{advice.title}</Text>
            </View>

            <View style={styles.bodyRow}>
                <Text style={styles.titleHeading}>Content:</Text>
                <Text style={styles.contentText}>{advice.content}</Text>
            </View>
            <Pressable style={styles.actionButton} onPress={seeNext}>
                <Text style={styles.actionText}>See Meal Plans</Text>
            </Pressable>
        </View>:

        <LoadingAnimation/>
    
        }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    innerContainer:{
        flex:1,
     
    },
    avatar:{
        borderRadius:60,
        width:70,
        height:70,
        borderWidth:1,
        borderColor:"#DEDEDE"
    },
    topRow:{
        padding:20,

        flexDirection:"row",
        alignItems:"center",
        gap:20,
        backgroundColor:"white"
    },
    bodyRow:{
        backgroundColor:"white",
        padding:20,
        paddingStart:30,
        marginTop:15,
        
        
    },

    titleHeading:{
        fontSize:14,
        color:"#838383",
        fontWeight:"bold"
    },
    titleText:{
        marginTop:5,
        fontWeight:"bold",
        fontSize:20,
        
    },

    contentText:{
        marginTop:5,
        fontSize:15,
    },

    actionButton:{
        backgroundColor:"#00ACAC",
        marginVertical:30,
        borderRadius:30,
        padding:20,
        width:200,
        alignSelf:"center"
    },
    actionText:{
        color:"white",
        fontWeight:"bold",
        textAlign:"center",
        fontSize:15
    }

})