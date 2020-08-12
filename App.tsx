import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register from './screens/register';
import Login from './screens/login';
import Home from './screens/home';
import Chat from './screens/chat';
import Profile from './screens/profile';
import Subscription from './screens/subscription';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: '#fff'
          },
          headerStyle: {
            backgroundColor: '#0c2c94',
          },
        }}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={({ navigation, route }) => ({
            title: 'Welcome',
            // headerRight: () => (
            //   <TouchableOpacity onPress={() => navigation.navigate('Profile',
            //     { user: route.params.user }
            //   )}>
            //     <Text style={styles.addBtn}>
            //       Profile
            //     </Text>
            //   </TouchableOpacity>
            // )
          })}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
        />
        <Stack.Screen
          name="Subscription"
          options={{
            title: "Select a package"
          }}
          component={Subscription}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
