import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register from './screens/register';
import Login from './screens/login';
import Home from './screens/home';
import Chat from './screens/chat';
import AddMember from './screens/profile';
import MemberChatList from './screens/memberChatList';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register"
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
          options={({ navigation }) => ({
            title: 'Welcome',
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.addBtn}>
                  Profile
                </Text>
              </TouchableOpacity>
            )
          })}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    color: '#000',
    fontSize: 16,
    marginRight: 20,
    borderRadius: 2,
    fontWeight: 'bold',
    backgroundColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 5
  },
});
