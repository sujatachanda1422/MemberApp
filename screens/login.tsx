import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    ActivityIndicator,
    ImageBackground,
    Image,
    Alert
} from 'react-native';
import firebase from '../database/firebase';
import AsyncStorage from '@react-native-community/async-storage';

const image = require("../images/login.jpg");
const logo = require("../images/chat1.jpg");
let userMobile = null;

export default class Login extends Component {

    constructor() {
        super();
        this.state = {
            mobile: '',
            loginPin: '1234',
            isLoading: false
        }
    }

    async componentDidMount() {
        userMobile = await AsyncStorage.getItem('loggedInMobile');
    }

    updateInputVal = (val: any, prop: any) => {
        const state = this.state;
        state[prop] = val;
        this.setState(state);
    }

    userLogin = () => {
        this.setState({
            isLoading: true,
        });

        firebase
            .firestore()
            .collection("member_list")
            .doc(userMobile)
            .get()
            .then((querySnapshot) => {
                const memberDetails = querySnapshot.data();
                console.log('Query - ', memberDetails);

                this.setState({
                    isLoading: false
                });

                if (!memberDetails) {
                    console.error('Mobile mumber not found');
                    return;
                }

                if (this.state.loginPin === memberDetails.loginPin) {
                    this.props.navigation.navigate('Home', { user: memberDetails });
                } else {
                    console.error('Wrong loginPin');
                }
            })
            .catch(error => {
                console.log('Login error = ', error);
                this.setState({ errorMessage: error.message });
            });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={styles.preloader}>
                    <ActivityIndicator size="large" color="#9E9E9E" />
                </View>
            )
        }
        return (
            <View style={styles.container}>
                <ImageBackground source={image} style={styles.image}>
                    <View style={styles.overlay}>
                        <View style={{
                            flex: 1,
                            // justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 20
                        }}>
                            <Image source={logo} style={{ marginTop: 10, width: 100, height: 100 }}></Image>
                            <Text style={{ fontSize: 20 }}>ChunMun</Text>
                        </View>
                        <TextInput
                            style={styles.inputStyle}
                            placeholder="Pin"
                            value={this.state.loginPin}
                            onChangeText={(val) => this.updateInputVal(val, 'loginPin')}
                            maxLength={4}
                            secureTextEntry={true}
                        />
                        <Button
                            color="#3740FE"
                            title="Sign In"
                            onPress={() => this.userLogin()}
                        />
                        {/* 
                        <Text
                            style={styles.loginText}
                            onPress={() => this.props.navigation.navigate('Register')}>
                            Don't have account? Click here to signup
                      </Text> */}
                    </View>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    overlay: {
        backgroundColor: 'rgba(199,199,199,0.3)',
        height: '100%',
        flexDirection: "column",
        justifyContent: "center",
        padding: 20,
    },
    image: {
        flex: 1,
        justifyContent: "center"
    },
    inputStyle: {
        width: '100%',
        marginBottom: 25,
        padding: 10,
        alignSelf: "center",
        backgroundColor: '#fff',
        borderRadius: 2
    },
    loginText: {
        color: '#fff',
        marginTop: 25,
        textAlign: 'center'
    },
    preloader: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    }
});