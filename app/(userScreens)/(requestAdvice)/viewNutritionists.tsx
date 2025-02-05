import { StyleSheet, Text, TextInput, View } from "react-native";
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from "react";
import { NutritionistAccount } from "~/types/common/nutritionists";
import LoadingAnimation from "~/components/LoadingAnimation";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import NutritionistCard from "~/components/cards/nutritionist-card";

export default function ViewNutritionists() {

  const [nutritionists,setNutritionists] = useState<NutritionistAccount []|null>([]);
  const [titleSearch,setTitleSearch] = useState("");
  const [loading,setLoading] = useState(false);

  const fetchNutritionist = async()=>{
    setLoading(true);
    try{
        const querySnapshot = await 
        firestore().collection('accounts')
        .where('role','==','nutritionist')
        .get();


        const nutritionistList = await Promise.all(
            querySnapshot.docs.map(async(doc)=>{
                const mainID = doc.id;
                const mainData = doc.data();
                
                // fetch profile_info subcollection
                const profileDoc = await firestore()
                .collection('accounts')
                .doc(doc.id)
                .collection('profile')
                .doc('profile_info')
                .get()
    
        
                // merge profile and main account data

                return {
                    id:mainID,
                    email:mainData.email,
                    role:mainData.role,
                    profile:profileDoc.exists ? profileDoc.data():null, // ensure profile exists

                } as NutritionistAccount;
            })       
        );
        console.log(nutritionistList);
        // update state
        setNutritionists(nutritionistList);

    }
    catch(err)
    {
        console.log(err);
    }

    setLoading(false);
  }
    // Filter nutritionists by name
    const filteredNutritionists = nutritionists?.filter((nutritionist) => {
        if (!titleSearch) return true; // If no search term, return all nutritionists
        return nutritionist.profile?.title
        ?.toLowerCase()
        .includes(titleSearch.toLowerCase());
    });

  useEffect(()=>{
    fetchNutritionist();
  },[])

  return (
    <ScrollView>
        {loading?
            <LoadingAnimation/>:

            <View style={{flex:1,padding:20}}>
                <Text style={{fontSize:18,fontWeight:"bold",margin:12}}>All Nutritionist available</Text>
                    <TextInput
                    style={styles.input}
                    onChangeText={setTitleSearch}
                    value={titleSearch}
                    placeholder="Search for your nutritionist name"
                    />
                <FlashList
                    data={filteredNutritionists||[]}
                    renderItem={({ item }) =>
                        <NutritionistCard item={item}/>
                    }
                    estimatedItemSize={200}
                    />
                <Pressable style={{backgroundColor:"black",paddingVertical:12,flex:1,borderRadius:10,marginTop:20}} onPress={fetchNutritionist}>
                    <Text style={{color:"white",fontWeight:"bold",textAlign:"center"}}>Refresh for new updates</Text>
                </Pressable>
            </View>    
        }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    input: {
      height: 60,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      paddingHorizontal:15,
      borderColor:"#C0C0C0",
      borderRadius:10
    },
    avatar:{
        borderRadius:60,
        width:50,
        height:50,
        borderWidth:1,
        borderColor:"#DEDEDE"
    },

    nutritionistBar:{
        flex:1,
        height:"auto",
        backgroundColor:"white",
        borderRadius:10,
        marginTop:10,
        padding:20,
        gap:20
    },

    pills:{
        backgroundColor:"#00ACAC",
        padding:10,
        borderRadius:30,
    },

    pillText:{
        color:"white"
    }
  });