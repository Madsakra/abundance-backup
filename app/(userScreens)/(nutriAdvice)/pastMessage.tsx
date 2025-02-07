
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import auth from '@react-native-firebase/auth';
import { AdviceInformation, StatusFeedbackDisplay } from '~/types/common/nutritionists';
import { useEffect, useState } from 'react';
import { collection, doc } from '@react-native-firebase/firestore';
import { db } from '~/utils';
import { Entypo } from '@expo/vector-icons';
import LoadingAnimation from '~/components/LoadingAnimation';

export default function PastMessage() {

    const { id,nutriID } = useLocalSearchParams();
    const documentId = Array.isArray(id) ? id[0] : id;
    const nutriUID = Array.isArray(nutriID) ? nutriID[0]:nutriID; 
    const currentUID = auth().currentUser?.uid;

    const [displayInfo,setDisplayInfo] = useState<StatusFeedbackDisplay|null>(null);
    const [advice,setAdvice] = useState<AdviceInformation|null>(null);

    const fetchData = async () => {
        console.log(documentId);
        console.log(nutriUID);


    try {
      // Reference to the "tailored_advice" document
      const displayInfoRef = doc(db, "accounts", currentUID!, "tailored_advice", nutriUID);
  
      // Reference to the "advice" subcollection
      const adviceCollectionRef = doc(db, "accounts", currentUID!, "tailored_advice", nutriUID,"advice",documentId);
  

      const displayInfo = await displayInfoRef.get();
      const adviceInfo = await adviceCollectionRef.get();
      setDisplayInfo(displayInfo.data() as StatusFeedbackDisplay);
      setAdvice(adviceInfo.data() as AdviceInformation);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


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


  
  useEffect(()=>{
    fetchData();
  },[])





  return (
    <ScrollView>
        {(advice && displayInfo)?
        <View style={styles.innerContainer}>

            <Pressable onPress={()=>router.navigate('/feedbackHistory')} style={{padding:20}}>
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
