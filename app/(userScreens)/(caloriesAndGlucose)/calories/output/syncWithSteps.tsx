import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'


export default function syncWithSteps() {



 


  return (
        <View style={{flex:1}}>
              <Text style={styles.header}>Sync with steps</Text>
              
              <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
                {/*TEMP DISPLAY*/}
              {/* <Pressable style={{borderRadius:100,borderWidth:1,padding:30,width:200,height:200,alignItems:"center",justifyContent:"center"}}>
                <Text style={{fontSize:25}}>Sync Data</Text>
              </Pressable> */}



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

})