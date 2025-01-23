import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function addActivity() {
  return (
    <View style={{flex:1}}>
        <Text style={styles.header}>Calorie Ouput</Text>

        <View style={{padding:30,alignItems:"center"}}>
            <Text>Calculate the calories output with the following tools:</Text>

            <Link href="/(userScreens)/(caloriesAndGlucose)/calories/output/syncWithSteps" style={{marginTop:30}} >
              <View style={styles.linkInnerContainer}>
              <AntDesign name="mobile1" size={25} color="#C68F5E" />
                  <Text style={styles.linkText}>Sync with phone steps</Text>
                  <AntDesign name="arrowright" size={25} color="black"  />
              </View>
            </Link>

            <Link href="/(userScreens)/(caloriesAndGlucose)/calories/output/metabolicEqui" style={{marginTop:20}} >
              <View style={styles.linkInnerContainer}>
              <FontAwesome name="heartbeat" size={25} color="#C68F5E" />
                  <Text style={styles.linkText}>Metabolic Equivalent (MET) Task Record</Text>
                  <AntDesign name="arrowright" size={25} color="black"  />
              </View>
            </Link>

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

  linkInnerContainer:{
    flexDirection:"row",
    borderWidth:1,
    padding:20,
    gap:20,
    alignItems:"center",
    borderRadius:10,
    borderColor:"#C68F5E"
  },

  linkText:{
    fontSize:12,
    fontWeight:"bold",
    color:"#545454",
    maxWidth:150
  }


});
