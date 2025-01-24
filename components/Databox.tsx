import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps } from 'react'
import { StyleSheet, Text, View } from 'react-native';

type DataBoxProps = {
    iconName?: ComponentProps<typeof Ionicons>['name'];
    subjectName:string,
    value:number,
    unit:string,
}


export default function Databox({iconName,subjectName,value,unit}:DataBoxProps) {
  return (
                 
                 
        <View style={styles.dataBox}> 
            <View style={{flexDirection:"row",gap:20,alignItems:"center"}}>
            <Text style={{ fontSize: 18 }}>{subjectName}</Text>
            <Ionicons name={iconName} size={24} color="black" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "300" }}>{value} {unit}</Text>
        </View>
  )
}


const styles = StyleSheet.create({
    dataBox:{
        flexDirection:"row",
        marginTop:10,
        padding:30,
        width:"90%",
        justifyContent:"space-between",
        alignItems:"center",
        alignSelf:"center",
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        borderRadius:5,
        shadowOpacity:  0.20,
        shadowRadius: 5.62,
        elevation: 18,
        backgroundColor:"white"
      },
    
})