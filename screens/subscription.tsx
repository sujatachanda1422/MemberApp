import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import firebase from '../database/firebase';
import CardSilder from './slider';

// Not assigning it in state since setPackage fn gets called multiple times
let packageSelected: number = 0;

export default class Subscription extends Component {
  db: firebase.firestore.Firestore;


  constructor() {
    super();
    this.state = {
      packages: [],
      isLoading: false
    }

    this.db = firebase.firestore();
  }

  updateInputVal = (val: any, prop: React.ReactText) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  updateUser = () => {
    console.log('State = ', this.state);

    this.setState({
      isLoading: true
    });

    this.db.collection("member_list").doc(this.state.mobile).set(this.state)
      .then(_ => {
        this.setState({
          isLoading: false
        });

        this.props.navigation.navigate('Home', { user: this.state });

        this.setState({
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

  UNSAFE_componentWillMount() {
    this.setState({
      isLoading: true
    });

    this.db.collection("package_list").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let docData: firebase.firestore.DocumentData;
        docData = doc.data();

        this.setState(prevState => {
          return {
            packages: [...prevState.packages, docData],
          };
        });
      });

      this.setState({
        isLoading: false
      });

      console.log('Pkg = ', this.state.packages);
    })
      .catch(err => {
        this.setState({
          isLoading: false
        });
        console.error('Error in package fetch', err);
      })
  }

  setSubscription() {
    const packageDetails = this.state.packages[packageSelected];
    const packageDoc = {
      member_mobile: this.props.route.params.user.mobile,
      package_name: packageDetails.name,
      request_date_time: new Date().toLocaleDateString("en-US"),
      status: 'pending',
      accepted_by: '',
      remaining_chat: packageDetails.chatNumber,
      expiry_date: '',
      name: this.props.route.params.user.name
    };

    console.log('Silder ', packageDoc);

    this.db.collection("subscription_list")
      .doc(packageDoc.member_mobile)
      .set(packageDoc)
      .then(_ => {
        alert('Thank you for subscribing. Your account will be updated soon.');

        Alert.alert('', 'Thank you for subscribing. Your account will be updated soon.',
          [
            {
              text: 'OK',
              onPress: () => this.props.navigation.navigate('Home', { user: this.props.route.params.user })
            }
          ]);
      })
      .catch(err => console.log('Add subscription err', err));

  }

  setPackage(currentPackage: number) {
    packageSelected = currentPackage;
  }

  getPackageColor(item: { name: string }) {
    switch (item.name) {
      case 'Bronze': return { backgroundColor: '#cd7f32' }
      case 'Silver':
      case 'Gold': return { backgroundColor: item.name.toLowerCase() }
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
        <CardSilder style={{ marginTop: 30 }} onPackageChange={this.setPackage}>
          {this.state.packages.map(((item) => (
            <View key={item.id} style={[styles.package, this.getPackageColor(item)]}
            >
              <Text style={[styles.packageText, { textTransform: 'capitalize' }]}>
                {item.name}
              </Text>
              <Text style={styles.packageText}>
                Chat count: {item.chatNumber}
              </Text>
              <Text style={styles.packageText}>
                Rs. {item.price}
              </Text>
              <Text style={styles.packageText}>
                Valid: {item.validity} Months
            </Text>
            </View>
          )))}
        </CardSilder>

        <TouchableOpacity
          onPress={() => this.setSubscription()}
          style={styles.button}>
          <Text style={styles.buttonText}>Subscribe</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: '#fff'
  },
  package: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dcdcdc'
  },
  packageText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  bronze: {
    backgroundColor: '#cd7f32'
  },
  gold: {
    backgroundColor: 'gold'
  },
  silver: {
    backgroundColor: 'silver'
  },
  button: {
    margin: 20,
    padding: 20,
    alignContent: 'center',
    backgroundColor: "#3740FE",
    borderRadius: 4
  },
  buttonText: {
    textAlign: 'center',
    color: "#fff",
    fontSize: 20,
    fontWeight: 'bold'
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