import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Review } from "~/types/common/review";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router, useLocalSearchParams } from "expo-router";
import {  StatusFeedbackDisplay } from "~/types/common/nutritionists";
import FunctionTiedButton from "~/components/FunctionTiedButton";
import Stars from "~/components/Stars";
import { Checkbox } from "react-native-paper";
import { useUserAccount, useUserProfile } from "~/ctx";


export default function ReviewNutri() {
   
    const { displayInfo } = useLocalSearchParams();
    const parsedDisplayInfo = JSON.parse(Array.isArray(displayInfo) ? displayInfo[0] : displayInfo) as StatusFeedbackDisplay;
    const [loading,setLoading] = useState(false);

    const [allReviews,setAllReviews] = useState<Review[]>([])
    const [showModal,setShowModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const {account} = useUserAccount();
    const {profile} = useUserProfile();

    const user = auth().currentUser;

    const fetchData = async()=>{
        setLoading(true);
        const querySnapshot = await firestore().collection('nutritionist_reviews').get();
          const temp = querySnapshot.docs.map((doc)=>({
              id:doc.id,
              ...doc.data(),
            }) as Review);
        setAllReviews(temp);
        checkReview();
        setLoading(false);
      };

      const handleSave = async ()=>{
        if (!selectedReview || selectedReasons.length<1)
        {
          alert("Please tap on at least one predefined review, and give at least 1 reason");
          return null;
        }
        else if (user && selectedReview)
        {
          try{
            // store on own account for reference - later can edit and prevent any further submission
            await firestore().collection('accounts').doc(user.uid).collection('nutritionist_reviews').doc(parsedDisplayInfo.nutritionistInfo.id).set({
              name: selectedReview.name,
              score: selectedReview.score,
              reasons: selectedReasons,
              nutritionist:parsedDisplayInfo
            });



            // store on nutritionist account so can display
            await firestore().collection('accounts').doc(parsedDisplayInfo.nutritionistInfo.id).collection('user_reviews').doc(user.uid).set({
                name: selectedReview.name,
                score: selectedReview.score,
                reasons: selectedReasons,
                userInfo:{
                  name:account?.name,
                  email:account?.email,
                  avatar:profile?.image
                }
              });
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
          router.replace('/allFeedback')
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

        const checkReview = async()=>{
            if (user)
            {
                const reviewDoc = await firestore().collection('accounts').doc(user.uid).collection('nutritionist_reviews').doc(parsedDisplayInfo.nutritionistInfo.id).get();
                if (reviewDoc.exists)
                {
                    const currentReview = reviewDoc.data() as Review
                    console.log(currentReview);
                    const matchingReview = allReviews.find((r) => r.name === currentReview.name);
                    if (matchingReview) {
                      setSelectedReview(matchingReview);
                      setSelectedReasons(currentReview.reasons);
                    }
                    
                }
    
            }
        }

        useEffect(() => {
            fetchData()
          }, []);

          useEffect(() => {
            if (allReviews.length > 0) {
              checkReview();
            }
          }, [allReviews]); // Runs again when `allReviews` updates
          
  return (
    <ScrollView style={{padding:10}}>
        
    {loading?
    <Modal>
           <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
           <ActivityIndicator size="large"/>
           </View>
    </Modal>:
    <View>
      <View style={{flexDirection:"row",alignItems:"center",gap:20,justifyContent:"center",marginVertical:20}}>
      <Image source={{uri:parsedDisplayInfo.nutritionistInfo.profile.avatar}} style={{width:70,height:70}}/>


      <View>
      <Text style={{fontFamily:"Poppins-Bold",fontSize:20,color:"#00ACAC"}}>{parsedDisplayInfo.nutritionistInfo.profile.title}</Text>
      <Text style={{fontFamily:"Poppins-Regular",fontSize:12,color:"#00ACAC",textAlign:"center"}}>{parsedDisplayInfo.nutritionistInfo.email}</Text>
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
                
                <FunctionTiedButton onPress={()=>router.back()} 
                  title="Go Back" 
                  buttonStyle={[styles.buttonContainer,{backgroundColor:"#969696",width:"35%"}]}
                  textStyle={styles.textStyle}/>
                
                <FunctionTiedButton onPress={handleSave} 
                  title="Save Information" 
                  buttonStyle={[styles.buttonContainer,{width:"60%",backgroundColor:"#8797DA"}]}
                  textStyle={styles.textStyle}/>
                </View>



    </View>
    }

      
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