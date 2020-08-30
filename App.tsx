import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register from './screens/register';
import Login from './screens/login';
import Home from './screens/home';
import Chat from './screens/chat';
import MenuItems from './screens/menuItems';
import Profile from './screens/profile';
import ChangePin from './screens/changePin';
import Subscription from './screens/subscription';
import MySubscription from './screens/mySubscription';
import {
  createDrawerNavigator
} from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function HomeComp() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          color: '#fff'
        },
        headerStyle: {
          backgroundColor: '#3b8dbd',
        },
      }}>
      <Stack.Screen name="Home" component={Home}
        options={({ navigation }) => ({
          title: 'ChunChun',
          headerLeft: () => {
            return <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Feather name="menu" size={32} color="white" style={{ marginLeft: 15 }} />
            </TouchableOpacity>;
          }
        })
        } />

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
        options={{
          title: 'Sign Up'
        }}
      />
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{
          headerTitleAlign: 'left',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
      />
      <Stack.Screen
        name="ChangePin"
        options={{
          title: 'Change Pin'
        }}
        component={ChangePin}
      />
      <Stack.Screen
        name="MySubscription"
        options={{
          title: "My Subscription"
        }}
        component={MySubscription}
      />
      <Stack.Screen
        name="Subscription"
        options={{
          title: "Select a package"
        }}
        component={Subscription}
      />
    </Stack.Navigator>
  )
}

function SideMenu() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          color: '#fff'
        },
        headerStyle: {
          backgroundColor: '#3b8dbd',
        },
      }}>
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <MenuItems {...props} />}
        initialRouteName="HomeComp"
      >
        <Drawer.Screen name="HomeComp"
          component={HomeComp}
        />
        {/* <Drawer.Screen name="SideMenu"
          component={SideMenu}
        /> */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
