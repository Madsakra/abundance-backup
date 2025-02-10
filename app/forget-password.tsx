import { getAuth, sendPasswordResetEmail } from "@react-native-firebase/auth";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import BackButton from "~/components/BackButton";
import FunctionTiedButton from "~/components/FunctionTiedButton";


export default function ForgetPassword() {

  const [email, setEmail] = useState<string>('');


    const resetPassword = async ()=>{
        try{
            const auth = getAuth();
            sendPasswordResetEmail(auth,email);
            alert("Password Reset Email Has been sent!")
        }
        catch(err)
        {
            alert("Error sending password reset email");
        }


    }


  return (
    <View style={{flex:1,backgroundColor:"white",justifyContent:"center",alignItems:"center",padding:20}}>
        <View style={{alignSelf:"flex-start",padding:20}}>
        <BackButton/>
        </View>
   
        <Text style={{marginBottom:25}}>Enter Your Accounts' Email for password reset</Text>
            <View
              style={{
                backgroundColor: '#F0F0F0',
                paddingVertical: 12,
                paddingHorizontal: 25,
                width: '90%',
                borderRadius: 50,
              }}>
              <Text style={{ fontFamily: 'Poppins-Medium' }}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={{width:"100%"}}
                inputMode="email"
              />
            </View>


         <FunctionTiedButton
            buttonStyle={styles.buttonBox}
            onPress={resetPassword}
            textStyle={styles.buttonText}
            title="Reset Password"
          />

        
    </View>
  )
}

const styles = StyleSheet.create({
    buttonBox: {
        backgroundColor: '#22CBCB',
        width: '80%',
        borderRadius: 30,
        marginTop: 40,
      },
    
      buttonText: {
        fontFamily: 'Poppins-Bold',
        fontSize: 20,
        color: 'white',
        padding: 10,
        textAlign: 'center',
      },
})