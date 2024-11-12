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
        <Swiper 
          autoplay 
          height={350}
          showsPagination={true}
          paginationStyle={{ bottom: 10 }}
          dotStyle={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          activeDotStyle={{ backgroundColor: '#FF8C00' }}
          autoplayTimeout={4}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.slideContainer}>
              <Image source={image} style={styles.image} />
            </View>
          ))}
        </Swiper>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('SignInScreen')}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('SignUpScreen')}
        >
          <Text style={styles.createAccountButton}>Tạo tài khoản</Text>
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
    marginBottom: 20,
  },
  headerText: {
    fontSize: 32,
    color: '#FF8C00',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  swiperContainer: {
    height: 350,
    marginVertical: 20,
    width: '100%',
  },
  slideContainer: {
    flex: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 15,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 40,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    paddingHorizontal: 120,
    borderRadius: 30,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  createAccountButton: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
