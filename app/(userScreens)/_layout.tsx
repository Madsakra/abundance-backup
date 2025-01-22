import { AntDesign, FontAwesome } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LoadingAnimation from '~/components/LoadingAnimation';
import { useUserAccount, useUserProfile } from '~/ctx';

function CustomDrawerContent(props: any) {
  const { bottom } = useSafeAreaInsets();
  const { profile, loading } = useUserProfile();
  const { account } = useUserAccount();

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View
          style={{
            padding: 15,
            paddingBottom: 20,
            flexDirection: 'row',
            gap: 15,
            alignItems: 'center',
          }}>
          {/* REPLACE VIEW WITH IMAGE LATER ON */}
          <View style={styles.container}>
            <Image source={{ uri: profile?.image || '' }} style={styles.image} />
          </View>

          <View style={{ justifyContent: 'center' }}>
            <Text
              style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: '#00ACAC', flexShrink: 1 }}>
              {account?.name}
            </Text>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12 }}>{account?.email}</Text>
          </View>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/*BOTTOM SECTION*/}
      <View
        style={{
          borderTopColor: '#dde3fe',
          borderTopWidth: 1,
          padding: 5,
          paddingStart: 10,
          paddingBottom: 10 + bottom,
        }}>
        <DrawerItem
          label="Logout"
          activeBackgroundColor="#00ACAC"
          onPress={() => auth().signOut()}
          icon={({ size, color }) => <AntDesign name="logout" size={size} color={color} />}
        />
      </View>
    </View>
  );
}

const DrawerLayout = () => {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        drawerActiveBackgroundColor: '#AEE8E8',
        drawerActiveTintColor: '#00ACAC',

        headerStyle: {
          backgroundColor: 'white',
          borderColor: '#D9D9D9',
          elevation: 0, // Android shadow
          shadowColor: 'transparent', // iOS shadow
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
        },

        headerTintColor: '#00ACAC',
        headerTitleStyle: {
          fontFamily: 'Poppins-Light',
          fontSize: 18,
        },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          headerTitleAlign: 'center',
          headerTitle: 'Home',
          drawerLabel: 'Home',

          drawerIcon: ({ size, color }) => <FontAwesome name="home" size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="(caloriesAndGlucose)"
        listeners={({ navigation }) => ({
          drawerItemPress: () => {
            // when user clicks on navigation, send them back to gateway
            router.replace('/(userScreens)/(caloriesAndGlucose)/gateway');
          },
        })}
        options={{
          headerTitleAlign: 'center',
          headerTitle: 'Calories and Glucose',
          drawerLabel: 'Calories and Glucose',
          drawerIcon: ({ size, color }) => <FontAwesome name="book" size={24} color={color} />,
        }}
      />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'gray',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default DrawerLayout;
