import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Pressable } from "react-native";
import Stars from "~/components/Stars";
import FunctionTiedButton from "~/components/FunctionTiedButton";
import { router } from "expo-router";

import { Review } from "~/types/common/review";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Checkbox } from "react-native-paper";



const goBack = ()=>{
    router.replace('/viewAppReviews')

}
 
 export default function addReview() {
  const [allReviews,setAllReviews] = useState<Review[]>([])
  const [showModal,setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const user = auth().currentUser;

  const fetchData = async()=>{
    const querySnapshot = await firestore().collection('app_reviews').get();
      const temp = querySnapshot.docs.map((doc)=>({
          id:doc.id,
          ...doc.data(),
        }) as Review);
    setAllReviews(temp);
  }

  const handleSave = async ()=>{
    if (!selectedReview || selectedReasons.length<1)
    {
      alert("Please tap on at least one predefined review, and give at least 1 reason");
      return null;
    }
    else if (user && selectedReview)
    {
      try{
        // sent data to firebase under collection user reviews
        await firestore().collection('user-Reviews-App').doc(user.uid).set({
          name: selectedReview.name,
          score: selectedReview.score,
          reasons: selectedReasons,
        })
        alert("Reviews Sent")
      }
      catch(err)
      {
        console.log("error sending reviews")
        console.log(err)
      }
    }
    else{
      console.log("error sending reviews")
      return null;
    }
      setShowModal(false);
      router.replace('/viewAppReviews')
  }


    // Handle selecting a review
    const handleReviewSelection = (review: Review) => {
      setSelectedReview(review);
      setSelectedReasons([]); // Reset reasons when a new review is selected
    };
  
    // Handle selecting/unselecting a reason
    const handleReasonToggle = (reason: string) => {
      setSelectedReasons((prev) =>
        prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
      );
    };
  

  useEffect(()=>{
    fetchData();
  },[])

   return (
    <ScrollView style={{padding:10}}>

      <View style={{flexDirection:"row",alignItems:"center",gap:20,justifyContent:"center",marginVertical:20}}>
      <Image source={require("assets/icon.png")} style={{width:70,height:70}}/>

      <View>
      <Text style={{fontFamily:"Poppins-Bold",fontSize:20,color:"#00ACAC"}}>Abundance</Text>
      <Text style={{fontFamily:"Poppins-Regular",fontSize:12,color:"#00ACAC",textAlign:"center"}}>Eat Well Live Well</Text>
      </View>

      </View>


      <Text style={styles.ratingHeader}>Add Review</Text>
      <View style={styles.ratingContainer}>
      <View style={styles.starRow}>
          <Text style={styles.heading}>Review Score</Text>
          <View>
            {selectedReview?.score?
            <Stars rating={selectedReview.score} />:
            <Stars rating={0} />  
            }
          
          </View>
      </View>
          <Text style={styles.subMessage}>* Please do not tap here as this is just to display average score awarded based on the tabs you have selected below.</Text>
      </View>


      <Text style={styles.ratingHeader}>Review Tabs</Text>
      <View style={styles.ratingContainer}>
      <Text style={styles.subHeading}>
        Tap on the tabs below to review our application. Your feedback is much appreciated!
      </Text>

  {/* Review Section */}
  <Text style={styles.ratingHeader}>Select a Review</Text>
      <View style={styles.reviewContainer}>
        {allReviews.map((review) => (
          <TouchableOpacity
            key={review.id}
            style={[
              styles.reviewButton,
              selectedReview?.id === review.id && styles.selectedReviewButton,
            ]}
            onPress={() => handleReviewSelection(review)}
          >
            <Text style={[
              selectedReview?.id === review.id && styles.reviewText
            ]}>{review.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reason Selection */}
      {selectedReview && (
        <View>
          <Text style={styles.ratingHeader}>Select Reasons</Text>
          {selectedReview.reasons.map((reason) => (
            <Pressable key={reason} style={styles.checkboxContainer}  onPress={() => handleReasonToggle(reason)}>
              <Checkbox
                status={selectedReasons.includes(reason) ? "checked" : "unchecked"}
             
                color="#4CAF50" // Customize the checkbox color
              />
              <Text style={styles.checkboxText}>{reason}</Text>
            </Pressable>
          ))}
        </View>
      )}
  
  
      </View>

      <View style={{flexDirection:'row',justifyContent:"space-between",padding:10,marginVertical:25}}>
                
                <FunctionTiedButton onPress={goBack} 
                  title="Go Back" 
                  buttonStyle={[styles.buttonContainer,{backgroundColor:"#969696",width:"35%"}]}
                  textStyle={styles.textStyle}/>
                
                <FunctionTiedButton onPress={handleSave} 
                  title="Save Information" 
                  buttonStyle={[styles.buttonContainer,{width:"60%",backgroundColor:"#8797DA"}]}
                  textStyle={styles.textStyle}/>
                </View>


      
    </ScrollView>
   )
 }
 


 const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 ,
    alignItems:"center"
  },

  heading: {
    fontSize: 17,
    marginVertical: 10,
    fontFamily: "Poppins-Regular",
  },

  ratingHeader:{
    backgroundColor:"#D9D9D9",
    width:"90%",
    alignSelf:"center",
    padding:10,
    margin:15,
    marginBottom:25
  },

  subHeading: { 
    fontSize: 14, 
    marginBottom: 20,
    fontFamily:"Poppins-Bold",
    color:"#8797DA" 
  },
  starsContainer: { 
    flexDirection: "row", 
    marginBottom: 20 
  },

  ratingContainer:{
    borderWidth:1,width:"90%",alignSelf:"center",borderColor:"#D9D9D9",padding:10
  },

  starRow:{
    flexDirection:"row",justifyContent:"space-between",alignItems:"center"
  },

  subMessage:{
    fontSize:12,
    marginTop:5
  },

  buttonContainer:{
    marginTop:5,
    padding:15,
    borderRadius:10,
  
  },

  textStyle:{
    textAlign:"center",
    fontFamily:"Poppins-Bold",
    color:"white",
    fontSize:15,
  },

  reviewContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "center", 
    padding: 10 
  },
  reviewButton: {
    padding: 10,
    margin: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
    minWidth: 80,
  },
  selectedReviewButton: { 
    backgroundColor: "#8797DA",
    
  },
  reviewText: { 
    fontSize: 20, 
    color:"white"
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10,
    flexShrink:1,
  },
});