import { Pressable, Text, View } from 'react-native';
import * as Linking from 'expo-linking'

export default function Membership() {


  const userSubscription = ()=>{
    Linking.openURL("https://docs.expo.dev/linking/into-your-app/")
  }



  return (
    <View>
      <Text>Membership</Text>
      <Pressable style={{backgroundColor:"purple",paddingVertical:20}} onPress={userSubscription}>
        <Text style={{color:"white"}}>Try Me!</Text>
      </Pressable>
    </View>
  );
}
