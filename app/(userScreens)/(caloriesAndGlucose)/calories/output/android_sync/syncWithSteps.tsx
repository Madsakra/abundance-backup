import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'


import { Platform } from 'react-native';
import {
    initialize,
    requestPermission,
    readRecords,
    getGrantedPermissions,
    openHealthConnectSettings,
    
  } from 'react-native-health-connect';
  import { Permission } from 'react-native-health-connect/lib/typescript/types';
  import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';
import { Button } from '~/components/Button';
import Databox from '~/components/Databox';
import PermissionView from '~/components/PermissionView';

const getLastTwoWeeksDate = (): Date => {
  return new Date(new Date().getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
};

const getTodayDate = (): Date => {
  return new Date();
};

export default function syncWithSteps() {

	const [androidPermissions, setAndroidPermissions] = useState<Permission[]>([]);
  const [loading,setLoading] = useState(false);
  const initializeHealthConnect = async () => {
   
    if (Platform.OS!=="android")
    {
      return;
    }
   
    else{
      const initialized = await initialize();
      if (!initialized){
        console.log("failed to initialize");
        return
      }
    }
  };






    const checkPermissions = async () => {
      const permissions = await getGrantedPermissions();      
      setAndroidPermissions(permissions);
    
    };
 
    const reGrantPermission = async () => {
      const permissions = await getGrantedPermissions();
      if (permissions.length !==4)
        {
          alert("Please grant the necessary permissions for us to collect data!")
        }      
      setAndroidPermissions(permissions);
    
    };
  


    const readSampleData = () => {
      readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: getLastTwoWeeksDate().toISOString(),
          endTime: getTodayDate().toISOString(),
        },
      })
        .then((result) => {
          console.log("Retrieved records: ", JSON.stringify({ result }, null, 2));
        })
        .catch((err) => {
          console.error("Error reading records ", { err });
        });
    };


    useEffect(()=>{
      if (Platform.OS==="android")
      {
        setLoading(true);
        initializeHealthConnect();
        checkPermissions();
        console.log(androidPermissions)
        setLoading(false);
      };
    },[])


  return (
        <View style={{flex:1}}>

            <View style={styles.header}>
            <Text style={{color:"white",fontWeight:"600"}}>Sync with steps</Text>
            </View>

             
              
              <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
                {
                  androidPermissions.length !==4?
 
       

                  <PermissionView
                  subTitle='Some permission is required for us to collect your health connect data.'
                  handleFunction={openHealthConnectSettings}
                  buttonTitle='Grant Permission'
                  image={require('assets/permission-img/health-connect.png')}
                  themeColor='#C68F5E'
                  subActionText='Check Permission'
                  secondaryAction={reGrantPermission}
                  />

           
                  
                  :
                    <View style={styles.container}>
                      
                      <Pressable style={styles.settings} onPress={openHealthConnectSettings}>
                      <Feather name="settings" size={24} color="#C68F5E" />
                      </Pressable>

                      <Databox
                      iconName='footsteps-sharp'
                      subjectName='Steps'
                      value={200}
                      unit='steps'
                      />

                      
                      <Databox
                      iconName='walk'
                      subjectName='Distance'
                      value={100}
                      unit='m'
                      />
                      <Databox
                      iconName='analytics'
                      subjectName='Floors Climbed'
                      value={2}
                      unit=''
                      />

                    </View>
                }

       

   
    
              </View>


     
        </View>
  )
}

const styles = StyleSheet.create({
  header: {
    padding:20,
    fontSize: 15,
    flexDirection:"row",
    justifyContent:"space-between",
    backgroundColor: '#C68F5E',
  },
  container:{
    flex:1,
    backgroundColor:"white",
    width:"100%"
  },

  settings:{
    alignSelf:"flex-end",
    margin:20,
    marginBottom:10
  },



})