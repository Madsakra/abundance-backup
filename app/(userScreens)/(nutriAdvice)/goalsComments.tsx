import { Entypo } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { AdviceInformation, StatusFeedbackDisplay } from '~/types/common/nutritionists';
import { Goal } from '~/types/common/goal';
import { useUserProfile } from '~/ctx';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function goalsComments() {
    const { profile } = useUserProfile();
    const { displayInfo, advice } = useLocalSearchParams();
    const user = auth().currentUser;
    const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
    const parsedAdvice = JSON.parse(Array.isArray(advice) ? advice[0] : advice) as AdviceInformation;
    const parsedDisplayInfo = JSON.parse(Array.isArray(displayInfo) ? displayInfo[0] : displayInfo) as StatusFeedbackDisplay;
    const [reviewd,setReviewd] = useState(false);

    useEffect(()=>{
        setSelectedGoals(profile?.goals || []);   
    },[profile])


    const checkReview = async()=>{
        if (user)
        {
            const reviewDoc = await firestore().collection('accounts').doc(user.uid).collection('nutritionist_reviews').doc(parsedDisplayInfo.nutritionistInfo.id).get();
            if (reviewDoc.exists)
            {
                setReviewd(true);
            }

        }
    }



    const seeNext = ()=>{
        router.navigate({
            pathname: '/reviewNutri',
            params: {
                displayInfo: displayInfo,
                advice:advice,
            }
        }
        )
     }

     useEffect(()=>{
        checkReview()
     },[])

  return (
    <ScrollView>

        <Pressable onPress={()=>router.back()} style={{padding:25,paddingBottom:5}}>
            <Entypo name="chevron-thin-left" size={20} color="black" />
        </Pressable>

        <View style={styles.container}>
            {selectedGoals.map((goal,index)=>(
                <View key={index}>
                <Text style={{fontWeight:"bold",marginBottom:8,marginStart:5}}>{goal.categoryID}</Text>
                <View key={index} style={styles.goalContainer}>
                    <Text style={styles.goalText}>{goal.min}-{goal.max} {goal.unit}</Text>
                </View>
                </View>
            ))}
        </View>

        <View style={styles.feedbackContainer}>
            <View>
            <Text style={styles.commentTitle}>Comments by {parsedDisplayInfo.nutritionistInfo.profile.title} </Text>
            <Text style={styles.commentContent}>{parsedAdvice.goalAdvice}</Text>
            </View>


            <Pressable style={reviewd?[styles.actionButton,{backgroundColor:"#999999"}]:styles.actionButton} onPress={seeNext} disabled={reviewd}>
                <Text style={styles.actionText}>Goals Feedback</Text>
            </Pressable>
        </View>



    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:25
    },

    goalContainer:{
        backgroundColor:"#6B7FD6",
        marginBottom:20,
        padding:18,
        borderRadius:30,
    },
    
    goalText:{
        color:"white",
        fontWeight:"bold",
        textAlign:"center",
    },

    feedbackContainer:{
        backgroundColor:"white",
        minHeight:300,
        padding:25,
        borderTopLeftRadius:30,
        borderTopRightRadius:30,
        justifyContent:"space-between"
    },

    commentTitle:{
        fontSize:20,
        fontWeight:"semibold",
        marginBottom:12
    },

    commentContent:{
        fontSize:14,
        marginVertical:10
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