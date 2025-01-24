import { AntDesign, Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'


import { Platform } from 'react-native';
import {
    initialize,
    requestPermission,
    readRecords,
    getGrantedPermissions,
    openHealthConnectSettings,
    aggregateRecord,
    
  } from 'react-native-health-connect';
  import { Permission } from 'react-native-health-connect/lib/typescript/types';
  import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';
import { Button } from '~/components/Button';
import Databox from '~/components/Databox';
import LoadingAnimation from '~/components/LoadingAnimation';
import PermissionView from '~/components/PermissionView';


const getStartOfToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to 00:00:00
  return today;
};

const getTodayDate = (): Date => {
  const endOfToday = new Date();
  endOfToday.setHours(23,59,59,59);
  return endOfToday;
};


export default function syncWithSteps() {

	const [androidPermissions, setAndroidPermissions] = useState<Permission[]>([]);
  const [loading,setLoading] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0); // in meters
  const [calories,setCalories] = useState(0);


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
  


    const fetchTodayData = async () => {
      setLoading(true);
      try {
        const stepResult = await aggregateRecord({
          recordType:'Steps',
          timeRangeFilter: {
            operator: "between",
            startTime: getStartOfToday().toISOString(),
            endTime: getTodayDate().toISOString(),
          },
        });
        const distanceResult = await aggregateRecord({
          recordType:'Distance',
          timeRangeFilter: {
            operator: "between",
            startTime: getStartOfToday().toISOString(),
            endTime: getTodayDate().toISOString(),
          },
        });

        // const caloriesResult = await aggregateRecord({
        //   recordType:'TotalCaloriesBurned',
        //   timeRangeFilter: {
        //     operator: "between",
        //     startTime: getStartOfToday().toISOString(),
        //     endTime: getTodayDate().toISOString(),
        //   },
        // });

  
        setSteps(stepResult.COUNT_TOTAL);
        setDistance(distanceResult.DISTANCE.inMeters);

        setInterval(()=>{
          setLoading(false);
        },3000);

  
      } catch (err) {
        console.error("Error fetching today's data:", err);
      }
    };


    useEffect(()=>{
      if (Platform.OS==="android")
      {
        setLoading(true);
        initializeHealthConnect();
        checkPermissions();
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
                      {
                          loading?
                          <LoadingAnimation/>:

                          <View>
                          <Pressable style={styles.settings} onPress={openHealthConnectSettings}>
                          <Feather name="settings" size={24} color="#C68F5E" />
                          </Pressable>

                          <Databox
                          iconName='footsteps-sharp'
                          subjectName='Steps'
                          value={steps}
                          unit='steps'
                          />

                          
                          <Databox
                          iconName='walk'
                          subjectName='Distance'
                          value={distance}
                          unit='m'
                          />

          
                          {distance?
                              <Pressable onPress={fetchTodayData} style={[styles.syncButton,{backgroundColor:"#C68F5E"}]}>
                                    <Text style={{color:"white",fontSize:18,fontWeight:"600"}}>Log Data</Text>
                              </Pressable>:
                              <Pressable onPress={fetchTodayData} style={styles.syncButton}>
                              <AntDesign name="sync" size={50} color="#C68F5E" />
                              </Pressable>  
                        
                          }
   

                          </View>
                        
                      }


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
    width:"100%",
  },

  settings:{
    alignSelf:"flex-end",
    margin:20,
    marginBottom:20
  },

  syncButton:{
    borderRadius:90,
    width:150,
    height:150,
    alignSelf:"center",
    marginTop:90,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"white",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity:  0.20,
    shadowRadius: 5.62,
    elevation: 18,
  },

  submitButton:{
    padding:20,
    paddingHorizontal:40,
    width:"80%",
    marginTop:150,
    alignSelf:"center",
    borderRadius:30,
    backgroundColor:"#C68F5E",
  },


})