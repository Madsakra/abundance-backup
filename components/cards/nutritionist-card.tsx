import { router } from 'expo-router'
import React from 'react'
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { NutritionistAccount } from '~/types/common/nutritionists'

interface NutritionistCardProps{
    item:NutritionistAccount
}



export default function NutritionistCard({item}:NutritionistCardProps) {
  return (
                    <View style={styles.nutritionistBar}>
                        
                           <View style={{flexDirection:"row",gap:10,alignItems:"center"}}>
                           <Image source={{uri:item?.profile?.avatar}} style={styles.avatar}/>
                            <View>
                            <Text style={{fontSize:20}}>{item.profile?.title}</Text>
                            <Text style={{fontSize:12,flexWrap:"wrap"}}>{item.email}</Text>
                            </View>
                          
                          
                           </View>
                     
                        <View style={{flexDirection:"column"}}>
                            <Text style={{marginBottom:30,fontSize:18,fontWeight:"bold"}}>Specialization:</Text>
                            <View style={{flexDirection:"row",gap:10,flexWrap:"wrap",maxWidth:300}}>
                        
                            {item.profile?.profileSpec?.map((spec,index)=>(
                                <View style={styles.pills} key={index}>
                                   
                                   {spec.variation?
                                        <Text style={styles.pillText}>{spec.variation}</Text>:
                                        <Text style={styles.pillText}>{spec.name}</Text>
                                    }
                                </View>
                            )) 
                            }
                            </View>
                        </View>

                        <TouchableOpacity style={styles.viewMore} onPress={()=>router.navigate(`/${item.id}`)}>
                            <Text style={styles.viewMoreText}>View More</Text>
                        </TouchableOpacity>
                    </View>
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
    },

    viewMore:{
        flex:1,
        backgroundColor:"#00ACAC",
        paddingVertical:10,
        marginTop:20,
        borderRadius:10
    },

    viewMoreText:{
        color:"white",
        fontSize:17,
        textAlign:"center",
        fontWeight:"bold"
    }

  });