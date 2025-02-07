import { Entypo } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { AdviceInformation, StatusFeedbackDisplay } from '~/types/common/nutritionists';

export default function MealPlans() {

    const { displayInfo, advice } = useLocalSearchParams();
  

    const parsedDisplayInfo = JSON.parse(Array.isArray(displayInfo) ? displayInfo[0] : displayInfo) as StatusFeedbackDisplay;
    const parsedAdvice = JSON.parse(Array.isArray(advice) ? advice[0] : advice) as AdviceInformation;

 const seeNext = ()=>{
    router.navigate({
        pathname: '/goalsComments',
        params: {
            displayInfo: displayInfo,
            advice:advice,
        }
    }
    )
 }



  return (
    <ScrollView>
        <Pressable onPress={()=>router.back()} style={{padding:25,paddingBottom:5}}>
        <Entypo name="chevron-thin-left" size={20} color="black" />
        </Pressable>


        
       <View style={{flex:1,padding:22}}>
            <Text style={styles.headerText}>Meal Plans</Text>
                <FlashList 
                data={parsedAdvice.mealPlans}
                renderItem={({item})=>
                    <View style={styles.mealPlanContainer}>

                    <View style={{flexDirection:"row",alignItems:"center",gap:20}}>
                        <Image source={require("assets/routeImages/cooked_food.jpg")} style={{width:70,height:70}}/>
                        <View>
                            <Text style={{fontSize:16,maxWidth:180,marginVertical:10,fontWeight:"bold"}}>{item.label}</Text>
                            <Text style={[styles.pill,{backgroundColor:"#C68F5E"}]}>Calories: {item.calories.quantity} {item.calories.unit}</Text>
                        </View>
                        
                    </View>
                    
                    <View style={{marginTop:10,gap:20,marginBottom:20}}>
                    <Text style={[styles.pill,{backgroundColor:"#FBA518"}]}>Fats: {item.fats.quantity} {item.fats.unit}</Text>
                    <Text style={[styles.pill,{backgroundColor:"#A89C29"}]}>Carbs: {item.carbs.quantity} {item.carbs.unit}</Text>
                    <Text style={[styles.pill,{backgroundColor:"#E195AB"}]}>Protein: {item.protein.quantity} {item.protein.unit}</Text>                    
                    </View>
                    </View>
                }
                estimatedItemSize={30}
                />
                           <Pressable style={styles.actionButton} onPress={seeNext}>
                               <Text style={styles.actionText}>Goals Feedback</Text>
                           </Pressable>
       </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    headerText:{
        fontSize:20,
        fontWeight:"bold",
        marginBottom:10
    },

    mealPlanContainer:{
        backgroundColor:"white",
        padding:10,
        marginVertical:5,
        borderRadius:5,
        gap:15
    
    },
    
    pill:{
        borderRadius:50,
        padding:8,
        paddingHorizontal:18,
        marginTop:4,
        color:"white",
        fontWeight:"bold"
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