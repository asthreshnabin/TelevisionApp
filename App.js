import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  NetInfo,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import {
  AdMobBanner,
  AdMobInterstitial,
} from 'react-native-admob'
import moment from 'moment'
import Spinner from 'react-native-loading-spinner-overlay';

let deviceWidth = Dimensions.get('window').width


class Channels extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      dataSource: []
    }
  }

  showAd = () => {
    AdMobInterstitial.setAdUnitID('ca-app-pub-6598244013768559/5282974200');
    AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
    AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd())
  }


  componentDidMount() {
    this.setState({ isLoading: true })
    this.listCategoriesWiseShows()
  }

  listCategoriesWiseShows = () => {
    return fetch('http://159.89.172.199/dishtv_categories')
      .then((response) => response.json())
      .then((responseJson) => {
        var favList = responseJson.favourites
        this.listAllTvShows(favList)

      })
      .catch((error) => {
        this.setState({ isLoading: false })
        console.error(error);
      });
  }
  listAllTvShows = (favList) => {
    return fetch('http://159.89.172.199/dishtv?genre=TV%20Show')
      .then((response) => response.json())
      .then((responseJson) => {
 
        const result = [];
        const map = new Map();
        for (const item of responseJson) {
          if (!map.has(item.channeldisplayname)) {
            map.set(item.channeldisplayname, true);    // set any value to Map
            result.push({
              channeldisplayname: item.channeldisplayname,
              channel_logo: item.channel_logo
            });
          }
        }


        this.setState({
          dataSource: concatedArry,
          isLoading: false
        }, function () {

        });

      })
      .catch((error) => {
        this.setState({ isLoading: false })
        console.error(error);
      });
  }
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.container}
          data={this.state.dataSource}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              this.showAd()
              this.props.navigation.push('Programs', item)
            }}>
              <View style={styles.item}>
                <Image style={styles.channel_logo} source={{ uri: item.channel_logo }} resizeMode='contain' />
                <Text style={styles.channel_name}>{item.channeldisplayname}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.channeldisplayname}
          numColumns={3} />
        {/* <BannerExample> */}
        <AdMobBanner
          adSize="banner"
          adUnitID="ca-app-pub-6598244013768559/9413790909"
          ref={el => (this._basicExample = el)}
        />

        {/* </BannerExample> */}
        <Spinner visible={this.state.isLoading} />
      </View>
    );
  }
}

class Programs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      isLoading: false
    }
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    return fetch('http://159.89.172.199/dishtv?channel=' + params.channeldisplayname)
      .then((response) => response.json())
      .then((responseJson) => {

        const result = [];
        let val = responseJson.sort((a, b) => parseFloat(a.start) - parseFloat(b.start))
        for (const item of val) {
          result.push({
            program_logo: item.program_logo,
            title: item.title,
            duration: display(moment(item.stop).diff(moment(item.start), 'minutes')),
            details: item.synopsis

          });
        }

        this.setState({
          dataSource: result,
        }, function () {

        });

      })
      .catch((error) => {
        console.error(error);
      });
  }


  showAd = () => {
    AdMobInterstitial.setAdUnitID('ca-app-pub-6598244013768559/5282974200');
    AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
    AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd())
  }

  loading = () => {
    if (this.state.isLoading) {
      return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', width: 250, height: 100, borderColor: '#666', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: '#000' }}>Please Wait!</Text>
            <Text style={{ fontSize: 14, color: '#000' }}>connecting to server</Text>
            <ActivityIndicator size="small" color="#000" />
          </View>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.container}
          data={this.state.dataSource}
          renderItem={({ item }) => (
            <View>
              <TouchableOpacity
                style={styles.program}
                onPress={() => {
                  NetInfo.isConnected.fetch().then(isConnected => {
                    if (!isConnected) {
                      Alert.alert(
                        'No Internet Connection',
                        'Please connect to internet to watch this program',
                        [
                          { text: 'OK' },
                        ],
                      )
                    } else {
                      this.setState({ isLoading: true })
                      this.showAd()
                      setTimeout(() => {
                        this.setState({ isLoading: false })
                        Alert.alert(
                          'Server is Busy',
                          'server is busy because of high traffic. would you like to try again?',
                          [
                            {
                              text: 'No', onPress: () => {
                                this.showAd()
                              }
                            },
                            {
                              text: 'Yes', onPress: () => {
                                this.showAd()
                                this.setState({ isLoading: true })
                              }
                            },
                          ],
                        )
                      }, 10000)
                    }
                  }).catch(err => console.error(err))
                }}>
                <Image style={styles.channel_logo} source={{ uri: item.program_logo }} resizeMode='contain' />
                <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 16, flex: 1 }}>
                  <Text style={{ fontSize: 20 }}>{item.duration}</Text>
                  <Text style={styles.channel_name}>{item.title}</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Details</Text>
                  <Text style={{ flex: 1, marginRight: 50 }} >{item.details}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={item => item.title}
          ItemSeparatorComponent={() => {
            return (
              <View style={{ backgroundColor: '#666', height: 1 }} />
            )
          }}
        />
        <AdMobBanner
          adSize="banner"
          adUnitID="ca-app-pub-6598244013768559/9413790909"
          ref={el => (this._basicExample = el)}
        />
        {this.loading()}

      </View>
    );
  }
}

const RootStack = createStackNavigator({
  Home: { screen: Channels, navigationOptions: { title: 'Channels' } },
  Programs: { screen: Programs, navigationOptions: { title: 'Programs' } }
});


export default class App extends Component {
  render() {
    return (
      <RootStack />
    );
  }
}

const styles = StyleSheet.create({

  item: {
    width: (deviceWidth / 3) - 10,
    height: (deviceWidth / 3) + 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    margin: 5,
    backgroundColor: '#fff',
    borderColor: '#999'
  },
  channel_logo: {
    width: (deviceWidth / 3) - 20,
    height: (deviceWidth / 3) - 20,
    marginTop: -20,
    alignItems: 'center',
    alignSelf: 'center'
  },
  channel_name: {
    fontWeight: 'bold',
    textAlign: 'center'
  },
  program: {
    flexDirection: 'row',
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
  },
  example: {
    paddingVertical: 10,
  },
  title: {
    margin: 10,
    fontSize: 20,
  },
});

function display(a) {
  var hours = Math.trunc(a / 60);
  var minutes = a % 60;
  return hours + "hrs : " + minutes + "mins"
}

