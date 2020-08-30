import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { FontAwesome, AntDesign, FontAwesome5 } from '@expo/vector-icons';

let loggedInUser: string | null = null;

export default class MenuItems extends Component {

    constructor() {
        super();
        this.state = {
            loggedInUser: false
        }
    }

    async UNSAFE_componentWillReceiveProps() {
        loggedInUser = await AsyncStorage.getItem('loggedInMobile');
        this.setState({ loggedInUser });
    }

    doLogout() {
        Alert.alert('', 'Are you sure, you want to leave?',
            [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        AsyncStorage.removeItem('loggedInUser');
                        AsyncStorage.removeItem('loggedInMobile');

                        this.props.navigation.navigate('HomeComp',
                            {
                                screen: 'Login'
                            }
                        )
                    }
                }
            ]);
    }

    async onMenuSelect(item: string) {
        let user;

        switch (item) {
            case 'pin':
                user = await AsyncStorage.getItem('loggedInUser');
                user = JSON.parse(user);

                this.props.navigation.navigate('HomeComp',
                    {
                        screen: 'ChangePin',
                        params: {
                            user
                        }
                    }
                )
                break;
            case 'subscription':
                user = await AsyncStorage.getItem('loggedInUser');
                user = JSON.parse(user);

                this.props.navigation.navigate('HomeComp',
                    {
                        screen: 'MySubscription',
                        params: {
                            user
                        }
                    }
                );

                break;
            case 'profile':
                this.props.navigation.navigate('HomeComp',
                    {
                        screen: 'Profile'
                    }
                );
                break;
            case 'logout': this.doLogout();

                break;
            case 'login':
                this.props.navigation.navigate('HomeComp',
                    {
                        screen: 'Login',
                        params: {
                            mobile: loggedInUser
                        }
                    }
                );
                break;
            case 'register':
                this.props.navigation.navigate('HomeComp',
                    {
                        screen: 'Register'
                    }
                );
                break;
        }

        this.props.navigation.closeDrawer();
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.loggedInUser &&
                    <View>
                        <TouchableOpacity style={styles.itemWrapper}
                            onPress={() => this.onMenuSelect('pin')}>
                            <FontAwesome name="pencil" size={24} color="#557dd6" />
                            <Text style={styles.item}>Change Pin</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.itemWrapper}
                            onPress={() => this.onMenuSelect('subscription')}>
                            <AntDesign name="creditcard" size={24} color="#557dd6" />
                            <Text style={styles.item}>My Subscription</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.itemWrapper}
                            onPress={() => this.onMenuSelect('profile')}>
                            <FontAwesome5 name="user-edit" size={24} color="#557dd6" style={{ marginLeft: -3 }} />
                            <Text style={styles.item}>Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.itemWrapper}
                            onPress={() => this.onMenuSelect('logout')}>
                            <FontAwesome5 name="power-off" size={24} color="#557dd6" />
                            <Text style={styles.item}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                }

                {!this.state.loggedInUser &&
                    <View>
                        <TouchableOpacity style={styles.itemWrapper}
                            onPress={() => this.onMenuSelect('login')}>
                            <FontAwesome name="sign-in" size={30} color="#557dd6" />
                            <Text style={styles.item}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.itemWrapper}
                            onPress={() => this.onMenuSelect('register')}>
                            <AntDesign name="adduser" size={30} color="#557dd6"
                                style={{ marginLeft: -3 }} />
                            <Text style={styles.item}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    itemWrapper: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#dcdcdc',
    },
    item: {
        color: '#2649c5',
        fontSize: 20,
        marginLeft: 20
    }
});