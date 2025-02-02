import { Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

export default function Membership() {

  const [result, setResult] = useState(null);

  const userSubscription = async ()=>{
    let result = await WebBrowser.openBrowserAsync('https://expo.dev');
   

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
