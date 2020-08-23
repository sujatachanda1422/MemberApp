import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import firebase from '../database/firebase';
import { RadioButton } from 'react-native-paper';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-community/picker';

const image = require("../images/bkg.jpg");
let cityList: firebase.firestore.DocumentData[] = [];

export default class Signup extends Component {
  db: firebase.firestore.Firestore;
  date: Date;

  constructor() {
    super();
    const dateNow = new Date();
    this.date = new Date(dateNow.getFullYear() - 18, dateNow.getMonth(), dateNow.getDate());

    this.state = {
      name: '',
      mobile: null,
      gender: 'female',
      city: 'Kolkata',
      dob: '',
      image: null,
      setDob: this.date,
      loginPin: null,
      otp: null,
      isLoading: false,
      isRegistered: false,
      isMobileVerified: null,
      isOtpSent: false,
      isLoginPinCreated: false,
      showDatePicker: false
    };

    this.db = firebase.firestore();
  }

  updateInputVal = (val: any, prop: string | number) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  async UNSAFE_componentWillMount() {
    await this.getCityList();
    this.setState({ isRegistered: this.props.route.params.verified });
  }

  async getCityList() {
    cityList = [];

    await this.db.collection("city_list").get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        cityList.push(doc.data());
      });
    });
  }

  registerUser() {
    if (!this.state.name.trim() || !this.state.dob) {
      Alert.alert('', 'Please provide all the details');
      return;
    }

    this.setState({
      isLoading: true
    });

    this.db.collection("member_list").doc(this.state.mobile).set({
      mobile: this.state.mobile,
      city: this.state.city,
      name: this.state.name,
      loginPin: this.state.loginPin,
      dob: this.state.dob,
      gender: this.state.gender,
      image: this.state.image
    })
      .then(_ => {
        this.props.navigation.navigate('HomeComp',
          {
            screen: 'Login',
            params: {
              mobile: this.state.mobile
            }
          }
        )

        this.setState({
          isLoading: false
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false
        });
        console.log('Register error = ', error);
      });
  }

  checkDuplicateMobile() {
    return this.db.collection("member_list")
      .doc(this.state.mobile).get().then(doc => {
        if (doc.exists && doc.data().mobile) {
          return doc.exists;
        }

        return false;
      });
  }

  async sendOtp() {
    if (!(/^\d{10}$/).test(this.state.mobile)) {
      Alert.alert('', 'Please provide a valid mobile number');
      return;
    }

    const isDuplicate = await this.checkDuplicateMobile();

    if (isDuplicate) {
      Alert.alert('', 'Mobile number already exists, please use another');
      return;
    }

    this.db.collection("member_list").doc(this.state.mobile).set({
      otp: Math.floor(1000 + Math.random() * 9000)
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
    if (!(/^\d{4}$/).test(this.state.otp)) {
      Alert.alert('', 'Please provide a valid OTP');
      return;
    }

    this.db.collection("member_list").doc(this.state.mobile).get()
      .then(doc => {
        const data = doc.data();
        if (data.otp == this.state.otp) {
          this.setState({
            isOtpSent: true,
            isLoginPinCreated: true,
          });
        } else {
          Alert.alert('Please provide the correct otp');
        }
      })
      .catch(error => {
        console.log('Verify otp error = ', error);
      });
  }

  verifyPin() {
    if (!(/^\d{4}$/).test(this.state.loginPin) ||
      !(/^\d{4}$/).test(this.state.loginPinVerify)) {
      Alert.alert('', 'Please provide a valid pin');
      return;
    }

    if (this.state.loginPin === this.state.loginPinVerify) {
      this.setState({
        isRegistered: true,
        isLoginPinCreated: false
      });
    } else {
      Alert.alert('', 'Verify pin does not match. Try again.');
    }
  }

  setDob(date: Date | undefined) {
    if (!date) {
      return;
    }

    const dateNow = new Date(this.date).getTime();
    const selectedDate = new Date(date).getTime();

    if (selectedDate < dateNow) {
      this.setState({
        dob: new Date(date).toLocaleDateString('en-US'),
        showDatePicker: false
      });
    } else {
      Alert.alert('', 'Age needs to be 18 years+',
        [
          {
            text: 'OK',
            onPress: () => this.setState({
              dob: '',
              showDatePicker: false
            })
          }
        ]);
    }
  }

  async pickImage() {
    const options = {
      title: 'Select Profile Picture'
    };

    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        try {
          this.setState({ isLoading: true });

          const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function () {
              reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", response.uri, true);
            xhr.send(null);
          });

          const mimeString = response.uri
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];

          const storageRef = firebase.storage().ref();
          const imageRef = storageRef.child(`images/${this.state.mobile}.jpg`);
          const snapshot = await imageRef.put(blob, { contentType: mimeString });

          const url = await snapshot.ref.getDownloadURL();

          console.log('Url', url);

          this.setState({ image: url, isLoading: false });
        }
        catch (err) {
          console.log("Img err ..........", err);
        }
      }
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
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} >
        <View style={styles.container}>
          <ImageBackground source={image} style={styles.image}>
            <View style={styles.overlay}>
              {(!this.state.isRegistered && !this.state.isOtpSent) &&
                <View>
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Enter Mobile"
                    keyboardType='numeric'
                    maxLength={10}
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
                    onPress={() => this.props.navigation.navigate('HomeComp',
                      {
                        screen: 'Login'
                      }
                    )}>
                    Already have an account?
                 </Text>
                </View>
              }

              {(!this.state.isRegistered && this.state.isOtpSent
                && !this.state.isLoginPinCreated) &&
                <View>
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Enter OTP"
                    maxLength={4}
                    keyboardType='numeric'
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
                </View>
              }

              {this.state.isRegistered &&
                <View>
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
                  <TouchableOpacity
                    style={styles.inputStyle}
                    onPress={() => this.setState({ showDatePicker: true })}
                  >
                    <Text>{this.state.dob ? this.state.dob : 'Date of Birth'}</Text>
                  </TouchableOpacity>
                  {this.state.showDatePicker &&
                    <RNDateTimePicker
                      value={this.state.setDob}
                      onChange={(evt, date) => this.setDob(date)}
                    />
                  }
                  <Picker
                    selectedValue={this.state.city}
                    style={styles.dropDown}
                    onValueChange={(itemValue) => this.setState({ city: itemValue })}>
                    {cityList.map(item => {
                      return <Picker.Item key={item.name} label={item.name} value={item.name} />
                    })}
                  </Picker>

                  <View style={{ marginBottom: 20 }}>
                    <Button title="Pick an image from camera roll" onPress={() => this.pickImage()} />
                    {this.state.image &&
                      <Image source={{ uri: this.state.image }}
                        style={{ marginTop: 20, width: 200, height: 200 }} />
                    }
                  </View>

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
      </KeyboardAwareScrollView>
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
    backgroundColor: 'rgba(199,199,199,0.4)',
    height: '100%',
    flexDirection: "column",
    justifyContent: "center",
    padding: 20
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
  dropDown: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#fff'
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