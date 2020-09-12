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
import CryptoJS from "react-native-crypto-js";
import { MaterialIcons } from '@expo/vector-icons';

const image = require("../images/sub.jpg");
const appIcon = require("../images/appIcon.png");
const userImg = require("../images/boy.jpg");

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
      doMobileVerify: true,
      doOTPVerify: false,
      doPinVerify: false,
      showDatePicker: false,
      doImageVerify: false,
      picUpload: false
    };

    this.db = firebase.firestore();
  }

  updateInputVal = (val: any, prop: string | number) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  UNSAFE_componentWillMount() {
    this.getCityList();
  }

  async getCityList() {
    cityList = [];

    await this.db.collection("city_list").get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        cityList.push(doc.data());
      });
    });
  }

  setForm() {
    if (!this.state.name.trim() || !this.state.dob) {
      Alert.alert('', 'Please provide all the details');
      return;
    }

    this.setState({
      doImageVerify: true,
      doFormVerify: false
    });
  }

  registerUser() {
    this.setState({
      isLoading: true
    });

    // Encrypt
    const encryptedPwd = CryptoJS.AES.encrypt(this.state.loginPin, 'chunchun').toString();

    this.db.collection("member_list").doc(this.state.mobile).set({
      mobile: this.state.mobile,
      city: this.state.city,
      name: this.state.name,
      loginPin: encryptedPwd,
      dob: new Date(this.state.dob).getTime(),
      gender: this.state.gender,
      image: this.state.image,
      createdAt: new Date().getTime()
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

  sendOTPInMobile(mobile: string, otp: number) {
    const url = 'https://portal.mobtexting.com/api/v2/sms/send';
    const params = 'access_token=1b28086bb8909e43654a2a100bdfbeb9&sender=YTHVSC&&service=T&'
    const msg = otp + ' is the OTP for your mobile number verification required to register in ChunChun App.';
    const fetchUrl = url + '?' + params + 'message=' + msg + '&to=' + mobile;

    fetch(fetchUrl)
      .then((json) => {
        console.log('SMS sent ', json.status);
      })
      .catch((error) => {
        console.log("SMS error = ", error);
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

    const otp = Math.floor(1000 + Math.random() * 9000);

    this.db.collection("member_list")
      .doc(this.state.mobile)
      .set({ otp })
      .then(_ => {
        this.sendOTPInMobile(this.state.mobile, otp);

        this.setState({
          doOTPVerify: true,
          doMobileVerify: false,
          number: otp
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
            doOTPVerify: false,
            doPinVerify: true
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
        doFormVerify: true,
        doPinVerify: false
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
      title: 'Select Profile Picture',
      noData: true,
      maxWidth: 500,
      maxHeight: 500,
      quality: 1,
      storageOptions: { privateDirectory: true }
    };

    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        try {
          this.setState({ picUpload: true });

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

          this.setState({ image: url, picUpload: false });
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
      <View style={styles.container}>
        <ImageBackground source={image} style={styles.image}>
          <View style={styles.imageWrapper}>
            <View style={{ marginTop: 20 }}>
              <Image source={appIcon} style={styles.appIcon} />
            </View>
            <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} >
              <View style={styles.overlay}>
                {this.state.doMobileVerify &&
                  <View>
                    <TextInput
                      style={styles.inputStyle}
                      placeholder="Enter your Mobile number"
                      keyboardType='numeric'
                      maxLength={10}
                      value={this.state.mobile}
                      onChangeText={(val) => this.updateInputVal(val, 'mobile')}
                    />

                    <Button
                      color="#3740FE"
                      title="Verify Mobile"
                      onPress={() => this.sendOtp()}
                    />

                    <Text
                      style={styles.loginText}
                      onPress={() => this.props.navigation.navigate('HomeComp',
                        {
                          screen: 'Login'
                        }
                      )}>
                      Already have an account? Login now
                 </Text>
                  </View>
                }

                {this.state.doOTPVerify &&
                  <View>
                    <TextInput
                      style={styles.inputStyle}
                      placeholder="Enter verification number"
                      maxLength={4}
                      keyboardType='numeric'
                      value={this.state.otp}
                      onChangeText={(val) => this.updateInputVal(val, 'otp')}
                    />

                    <Text style={{marginBottom: 10}}>Verification number: {this.state.number}</Text>

                    <Button
                      color="#3740FE"
                      title="Verify Number"
                      onPress={() => this.verifyOtp()}
                    />
                  </View>
                }

                {this.state.doPinVerify &&
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

                {this.state.doFormVerify &&
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

                    <Button
                      color="#3740FE"
                      title="Verify Details"
                      onPress={() => this.setForm()}
                    />
                  </View>
                }

                {this.state.doImageVerify &&
                  <View>
                    <TouchableOpacity style={{ width: 200, position: 'relative', alignSelf: 'center', marginBottom: 100 }}
                      onPress={() => this.pickImage()} >
                      {this.state.picUpload === true &&
                        <View style={styles.picLoader}>
                          <ActivityIndicator size="large" color="#dcdcdc" />
                        </View>
                      }
                      <Image source={this.state.image ?
                        { uri: this.state.image } : userImg}
                        style={styles.profileImg} />
                      <MaterialIcons name="add-a-photo" size={36} color="black" style={styles.icon}
                      />
                    </TouchableOpacity>

                    <Button
                      color="#3740FE"
                      title="Sign Up"
                      onPress={() => this.registerUser()}
                    />
                  </View>

                }
              </View>
            </KeyboardAwareScrollView>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex"
  },
  overlay: {
    height: '100%',
    justifyContent: "center",
    padding: 20
  },
  image: {
    flex: 1
  },
  imageWrapper: {
    backgroundColor: 'rgba(199,199,199,0.4)',
    flexGrow: 1
  },
  icon: {
    position: 'absolute',
    right: -15,
    top: 10
  },
  imgOverlay: {
    alignItems: 'center',
    marginVertical: 30
  },
  profileImg: {
    width: 200,
    height: 200
  },
  picLoader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 200,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfdfd85',
    zIndex: 1
  },
  appIcon: {
    borderRadius: 100,
    width: 100,
    height: 100,
    alignSelf: 'center'
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