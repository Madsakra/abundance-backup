import { Entypo } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { Link, router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { MET_task } from '~/types/common/calories'
import { db } from '~/utils'


export default function metabolicEqui() {


  const [metTasks,setMetTasks] = useState<MET_task[]| null>(null)


  const fetchData = async ()=>{
    const querySnapshot = await db.collection('MET_tasks').get();
    let temp:MET_task[] = [];
    querySnapshot.docs.forEach(docSnapshot=>{
      
        temp.push({
            id:docSnapshot.id,
            ...docSnapshot.data(),
        } as MET_task)
    })
    setMetTasks(temp);
}

 const addMetabolicTask = (metabolicTask: MET_task)=>{
    router.push({
        pathname: '/calories/output/metabolicTask',
        params: { 
           id:metabolicTask.id,
           name:metabolicTask.name,
           value:metabolicTask.value
         },
      });
 }


useEffect(()=>{
  fetchData();
},[])


  return (
    <View>
            <Text style={styles.header}>Calorie Ouput</Text>
            <Link
            href="/(userScreens)/(caloriesAndGlucose)/calories/output/addActivity"
            style={styles.seperaterStyle}>
            <Entypo name="chevron-thin-left" size={24} color="black" />
            </Link>

            <Text style={styles.subCaption}>Calculate your calories output by selecting the task below</Text>


            <View style={{ height: 300, width: Dimensions.get("screen").width }}>
            <FlashList
            data={metTasks}
            renderItem={({item})=>(
                <Pressable style={styles.dataBox} onPress={()=>addMetabolicTask(item)}>
                    <Text style={{fontSize:18}}>{item.name}</Text>
                    <Text style={{fontSize:15,fontWeight:"300"}}>{item.value}  Met</Text>
                </Pressable>
            )}
            estimatedItemSize={200}
            />
            </View>



    </View>
  )
}


const styles = StyleSheet.create({
  header: {
    padding:20,
    fontSize: 15,
    fontWeight:"bold",
    backgroundColor: '#C68F5E',
    color:"white"
  },

  subCaption:{
        padding:30,
        paddingTop:5,
        fontSize:15,
        fontWeight:"500"
  },


  seperaterStyle:{
    marginHorizontal: 20, 
    marginVertical: 25 
  },

  dataBox:{
    marginTop:10,
    padding:20,
    width:"90%",
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    borderRadius:5,
    shadowOpacity:  0.20,
    shadowRadius: 5.62,
    elevation: 18,
    backgroundColor:"white",
    alignSelf:"center"
  },

 


})