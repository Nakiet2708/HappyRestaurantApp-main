import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { colors, parameters } from "../../global/styles";
import Swiper from 'react-native-swiper';
import { StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

const images = [
  require('../../../assets/Image/Happy.jpg'),
  
  require('../../../assets/Image/view1.jpg'),
  require('../../../assets/Image/view2.jpg'),
  // Thêm các ảnh khác nếu cần
];

const statusBarHeight = StatusBar.currentHeight || 0;

export default function SignInWelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>HAPPY RESTAURANTS</Text>
        <Text style={styles.headerText}></Text>
      </View>

      <View style={styles.swiperContainer}>
        <Swiper autoplay height={300} showsPagination={false}>
          {images.map((image, index) => (
            <Image key={index} source={image} style={styles.image} />
          ))}
        </Swiper>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('SignInScreen')}
        >
          <Text style={styles.buttonText}>SIGN IN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('SignUpScreen')}
        >
          <Text style={styles.createAccountButton}>Create your account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  headerText: {
    fontSize: 22,
    color: colors.buttons,
    fontWeight: 'bold',
  },
  swiperContainer: {
    height: 300,
    marginTop: 20,
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 30,
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.buttons,
    paddingVertical: 15,
    paddingHorizontal: 150,
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createAccountButton: {
    color: colors.grey3,
    fontSize: 16,
  },
});
