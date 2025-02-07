import { Link, router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import firestore from '@react-native-firebase/firestore';

import { useEffect, useState } from "react";
import auth from '@react-native-firebase/auth';
import { Review } from "~/types/common/review";
import Stars from "~/components/Stars";
import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons";
import { CustomAlert } from "~/components/alert-dialog/custom-alert-dialog";



export default function viewAppReviews() {


  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [confirmation,setConfirmation] = useState(false);

  const user = auth().currentUser;
  const fetchData = async()=>{
    const querySnapshot = await firestore().collection('user-Reviews-App').doc(user?.uid).get();
    const reviewData = querySnapshot.data()?.review as Review;
    setSelectedReview({
      id:querySnapshot.id,
      name:reviewData.name,
      score:reviewData.score,
      reasons:reviewData.reasons
    }) 
   
    setSelectedReasons(reviewData.reasons);
  };


  const handleClose = ()=>{
    setConfirmation(false);
  };


  const handleRemove = async()=>{
    if (user)
    {
      try{
        await firestore().collection('user-Reviews-App').doc(user.uid).delete();
        alert("Your Review Has Been Removed!");
        setConfirmation(false);
        setSelectedReview(null);
        setSelectedReasons([]);
        
      }
      catch(err)
      {
        console.log(err)
      }
    }

  }

  useEffect(()=>{
    fetchData();
  },[])

  


  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
        
      <CustomAlert
          visible={confirmation}
          title="Remove Review?"
          message="Are you sure you want to remove your review?"
          onClose={handleClose}
          onConfirm={handleRemove}
        />
    

    {(selectedReview!==null && selectedReasons.length > 0)?
    <View style={{width:"100%",flexGrow:1}}>
      <Text style={{marginBottom:20,fontSize:20,fontWeight:"700"}}>Your Review</Text>

      <View style={{flex:1,width:"100%",backgroundColor:"white",padding:25}}>
        <Text style={{fontSize:22,marginVertical:15}}>Given Review : {selectedReview.name}</Text>
        <Stars rating={selectedReview.score}/>
        {selectedReasons.map((reason,index)=>(
                     <View
                     key={index}
                     style={{
                       backgroundColor: "#8797DA",
                       padding: 10,
                       borderRadius: 30,
                       flexDirection: "row",
                       alignItems: "center",
                       marginTop: 20,
                       
                     }}
                   >
                     <FontAwesome
                       name="circle"
                       size={16}
                       color="white"
                       style={{ marginRight: 10 }}
                     />
                     <Text style={{ color: "white", fontFamily: "Poppins-Regular",flexShrink:1 }}>
                       {reason}
                     </Text>
                   </View>
        ))}

        <View style={{flex:1,justifyContent:"center",gap:10}}>
          <Pressable style={[styles.actionButtonContainer,{backgroundColor:"#6B7FD6",}]} onPress={()=>router.navigate('/editReview')}>
            <Text style={{textAlign:"center",color:"white",fontSize:15}}>Edit Review</Text>
            <AntDesign name="edit" size={24} color="white" />
          </Pressable>
          
          <Pressable style={[styles.actionButtonContainer,{backgroundColor:"#D53C4A"}]} onPress={()=>setConfirmation(true)}>
            <Text style={{textAlign:"center",color:"white",fontSize:15}}>Remove Review</Text>
            <Entypo name="trash" size={24} color="white" />
          </Pressable>
        </View>
      </View>

    </View>:



    <View style={styles.scrollViewContent}>
    <Text style={styles.titleText}>We See That You Do Not have an app review yet</Text>
    <Text style={styles.subtitleText}>Tap On the button below to add one</Text>
        
    <View style={styles.buttonContainer}>
    <Link href="/addReview">
      <View style={styles.button}>
        <Text style={styles.buttonText}>Add Reviews</Text>
      </View>
    </Link>
  </View>

    </View>

  
    }


    


    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20,
  },
  titleText: {
    marginVertical: 10,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitleText: {
    marginTop: 5,
    marginBottom: 20,
    fontSize: 15,
    textAlign: "center",
  },
  buttonContainer: {
    alignItems: "center", // Ensures the button stays centered
    width: "100%", 
  },
  button: {
    padding: 14,
    backgroundColor: "#8797DA",
    borderRadius: 5,
    alignItems: "center", // Centers text inside the button
  },
  buttonText: {
    color: "white",
    fontWeight:"bold"
  },

  actionButtonContainer:{
    paddingVertical:20,
    gap:5,
    borderRadius:10,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center"
  }

});