import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator, ImageBackground } from 'react-native';
import firebase from '../database/firebase';
import { RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';

const image = require("../images/bkg.jpg");

export default class Signup extends Component {
  db: firebase.firestore.Firestore;

  constructor() {
    super();

    this.state = {
      name: '',
      mobile: '',
      gender: 'male',
      city: '',
      dob: '',
      loginPin: '',
      otp: '',
      isLoading: false,
      isRegistered: null,
      isMobileVerified: null,
      isOtpSent: false,
      isLoginPinCreated: false,
      wrongOtp: false
    }

    this.db = firebase.firestore();
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  UNSAFE_componentWillMount() {
    this.setState({ isRegistered: this.props.route.params.verified });
  }

  async registerUser() {
    console.log('State = ', this.state);

    this.setState({
      isLoading: true
    });

    this.db.collection("member_list").doc(this.state.mobile).set({
      mobile: this.state.mobile,
      city: this.state.city,
      name: this.state.name,
      loginPin: this.state.loginPin,
      dob: this.state.dob,
      gender: this.state.gender
    })
      .then(_ => {
        AsyncStorage.setItem('loggedInMobile', this.state.mobile);

        this.props.navigation.navigate('Login', { mobile: this.state.mobile });

        this.setState({
          isLoading: false
        });
      })
      .catch(error => {
        console.log('Register error = ', error);
      });
  }

  sendOtp() {
    console.log('Mobile = ', this.state.mobile);

    this.db.collection("member_list").doc(this.state.mobile).set({
      otp: Math.floor((Math.random() * 10000) + 1)
    })
      .then(_ => {
        this.setState({
          isOtpSent: true
        });
      })
      .catch(error => {
        console.log('Send otp error = ', error);
      });
  }

  verifyOtp() {
    this.db.collection("member_list").doc(this.state.mobile).get()
      .then(doc => {
        const data = doc.data();
        if (data.otp == this.state.otp) {
          this.setState({
            isOtpSent: true,
            wrongOtp: false,
            isLoginPinCreated: true,
          });
        } else {
          this.setState({
            wrongOtp: true
          });
        }
      })
      .catch(error => {
        console.log('Verify otp error = ', error);
      });
  }

  verifyPin() {
    if (this.state.loginPin === this.state.loginPinVerify) {
      this.setState({
        isRegistered: true,
        isLoginPinCreated: false,
        wrongOtp: false
      });
    } else {
      this.setState({
        wrongOtp: true
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
            {(!this.state.isRegistered && !this.state.isOtpSent) &&
              <View>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Enter Mobile"
                  value={this.state.mobile}
                  onChangeText={(val) => this.updateInputVal(val, 'mobile')}
                />

                <Button
                  color="#3740FE"
                  title="Send OTP"
                  onPress={() => this.sendOtp()}
                />
{/* 
                <Text
                  style={styles.loginText}
                  onPress={() => this.props.navigation.navigate('Login')}>
                  Already have an account? Click here to go to Login page.
           </Text> */}
              </View>
            }

            {(!this.state.isRegistered && this.state.isOtpSent
              && !this.state.isLoginPinCreated) &&
              <View>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Enter OTP"
                  value={this.state.otp}
                  onChangeText={(val) => this.updateInputVal(val, 'otp')}
                />

                <Button
                  color="#3740FE"
                  title="Verify OTP"
                  onPress={() => this.verifyOtp()}
                />
                {this.state.wrongOtp &&
                  <Text>Wrong OTP please verify and try again</Text>
                }
              </View>
            }

            {(!this.state.isRegistered && this.state.isLoginPinCreated) &&
              <View>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Create login pin (4 digits)"
                  keyboardType='numeric'
                  value={this.state.loginPin}
                  secureTextEntry={true}
                  maxLength={4}
                  onChangeText={(val) => this.updateInputVal(val, 'loginPin')}
                />
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Re-enter login pin"
                  keyboardType='numeric'
                  value={this.state.loginPinVerify}
                  secureTextEntry={true}
                  maxLength={4}
                  onChangeText={(val) => this.updateInputVal(val, 'loginPinVerify')}
                />

                <Button
                  color="#3740FE"
                  title="Verify Pin"
                  onPress={() => this.verifyPin()}
                />
                {this.state.wrongOtp &&
                  <Text>Wrong pin please verify and try again</Text>
                }
              </View>
            }

            {this.state.isRegistered &&
              <View style={styles.overlay}>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Full Name"
                  value={this.state.name}
                  onChangeText={(val) => this.updateInputVal(val, 'name')}
                />
                <RadioButton.Group onValueChange={value => this.updateInputVal(value, 'gender')}
                  value={this.state.gender}>
                  <View style={styles.radio}>
                    <Text style={styles.radioText}>Gender: </Text>
                    <RadioButton.Item label="Male" value="male" color='blue' style={styles.radioBtn} labelStyle={styles.radioBtnLbl} />
                    <RadioButton.Item label="Female" value="female" color='blue' style={styles.radioBtn} labelStyle={styles.radioBtnLbl} />
                  </View>
                </RadioButton.Group>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Date of Birth"
                  value={this.state.dob}
                  onChangeText={(val) => this.updateInputVal(val, 'dob')}
                />
                <TextInput
                  style={styles.inputStyle}
                  placeholder="City"
                  value={this.state.city}
                  onChangeText={(val) => this.updateInputVal(val, 'city')}
                />

                <Button
                  color="#3740FE"
                  title="Sign Up"
                  onPress={() => this.registerUser()}
                />
              </View>
            }
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
  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff'
  },
  radioText: {
    lineHeight: 30,
    fontSize: 14
  },
  radioBtn: {
    marginRight: 20,
  },
  radioBtnLbl: {
    fontSize: 14
  },
  loginText: {
    color: '#fff',
    marginTop: 25,
    textAlign: 'center'
  }
});