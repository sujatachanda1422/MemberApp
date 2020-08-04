import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    Alert,
    ActivityIndicator,
    ImageBackground,
    Image
} from 'react-native';
import firebase from '../database/firebase';

const image = require("../images/login.jpg");

export default class Login extends Component {

    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            isLoading: false
        }
    }

    updateInputVal = (val: any, prop: any) => {
        const state = this.state;
        state[prop] = val;
        this.setState(state);
    }

    userLogin = () => {
        if (this.state.email === '' && this.state.password === '') {
            Alert.alert('Enter details to signin!')
        } else {
            this.setState({
                isLoading: true,
            })
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then((res) => {
                    console.log('User logged-in successfully!', res);

                    this.setState({
                        isLoading: false,
                        email: '',
                        password: ''
                    });

                    this.props.navigation.navigate('Home');
                })
                .catch(error => {
                    console.log('Login error = ', error);
                    this.setState({ errorMessage: error.message });
                });
        }
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
                        <View style={{ flex: 1, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            marginTop: 20 }}>
                            {/* <Image
                                style={{
                                    flex: 1,
                                    resizeMode: 'cover',
                                    width: 400,
                                    height: 50,
                                }}
                                source={require('../images/chat.png')}
                            /> */}
                            <Text style={{ position: 'absolute', fontSize: 20 }}>ChunMun</Text>
                        </View>
                        <TextInput
                            style={styles.inputStyle}
                            placeholder="Email"
                            value={this.state.email = 'test321@test.com'}
                            onChangeText={(val) => this.updateInputVal(val, 'email')}
                        />
                        <TextInput
                            style={styles.inputStyle}
                            placeholder="Password"
                            value={this.state.password = 'test321'}
                            onChangeText={(val) => this.updateInputVal(val, 'password')}
                            maxLength={15}
                            secureTextEntry={true}
                        />
                        <Button
                            color="#3740FE"
                            title="Signin"
                            onPress={() => this.userLogin()}
                        />

                        <Text
                            style={styles.loginText}
                            onPress={() => this.props.navigation.navigate('Register')}>
                            Don't have account? Click here to signup
                 </Text>
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