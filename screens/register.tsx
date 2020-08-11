import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator, ImageBackground } from 'react-native';
import firebase from '../database/firebase';
import { RadioButton } from 'react-native-paper';

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
      pin: '',
      isLoading: false,
      isRegistered: null,
      isMobileVerified: null,
      isOtpSent: false
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

  registerUser = () => {
    console.log('State = ', this.state);

    this.setState({
      isLoading: true
    });

    this.db.collection("member_list").doc(this.state.mobile).set(this.state)
      .then(_ => {
        this.props.navigation.navigate('Login', { mobile: this.state.mobile });

        this.setState({
          isLoading: false,
          name: '',
          mobile: '',
          gender: 'male',
          city: '',
          dob: '',
          pin: ''
        });
      })
      .catch(error => {
        console.log('Register error = ', error);
        this.setState({ errorMessage: error.message });
      });
  }

  sendOtp() {
    console.log('Mobile = ', this.state.mobile);

    this.db.collection("member_list").doc(this.state.mobile).set(this.state)
      .then(_ => {
        this.setState({
          isOtpSent: true
        });
      })
      .catch(error => {
        console.log('Register error = ', error);
      });
  }

  verifyOtp() {
    console.log('Mobile = ', this.state.mobile);

    return;

    this.db.collection("member_list").doc(this.state.mobile).set(this.state)
      .then(_ => {
        this.setState({
          isOtpSent: true
        });
      })
      .catch(error => {
        console.log('Register error = ', error);
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
            {!this.state.isRegistered &&
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

                <Text
                  style={styles.loginText}
                  onPress={() => this.props.navigation.navigate('Login')}>
                  Already have an account? Click here to go to Login page.
           </Text>
              </View>
            }

            {(!this.state.isRegistered && this.state.isOtpSent) &&
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
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Create login pin (4 digits)"
                  keyboardType='numeric'
                  value={this.state.pin}
                  secureTextEntry={true}
                  onChangeText={(val) => this.updateInputVal(val, 'pin')}
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