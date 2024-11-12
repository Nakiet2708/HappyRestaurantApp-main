import React, { useEffect, useState, useRef } from 'react';
import { View, PermissionsAndroid, Platform, Alert, TextInput, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const GEOAPIFY_API_KEY = 'be8283f0ca404169924653620c942bfa';

const Map = ({ navigation }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [address, setAddress] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission to access location',
            message: 'We need your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentPosition();
        } else {
          Alert.alert('Location permission denied');
        }
      } else {
        getCurrentPosition();
      }
    };

    const getCurrentPosition = (showLoading = false) => {
      return new Promise((resolve, reject) => {
        if (showLoading) {
          Alert.alert('Thông báo', 'Đang lấy vị trí của bạn...');
        }
  
        // Luôn lấy vị trí mới khi bấm nút
        const locationOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Đặt thành 0 để không sử dụng cache
        };
  
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('Lấy vị trí mới:', position);
            const { latitude, longitude } = position.coords;
            setCurrentPosition({ latitude, longitude });
            resolve(position);
          },
          (error) => {
            // Nếu lỗi, thử lại với độ chính xác thấp
            Geolocation.getCurrentPosition(
              (position) => {
                console.log('Lấy vị trí (độ chính xác thấp):', position);
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ latitude, longitude });
                resolve(position);
              },
              (secondError) => {
                console.error('Lỗi lấy vị trí:', secondError);
                reject(secondError);
              },
              {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 0,
              }
            );
          },
          locationOptions
        );
      });
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (currentPosition && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  }, [currentPosition]);

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setCurrentPosition(coordinate);
    
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=vi`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const addressData = data.features[0].properties;
        const formattedAddress = [
          addressData.housenumber,
          addressData.street,
          addressData.district,
          addressData.city,
          addressData.country
        ].filter(Boolean).join(', ');
        
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      Alert.alert('Error', 'Không thể lấy địa chỉ. Vui lòng thử lại.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ margin: 10 }}>
        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            paddingLeft: 8,
            marginBottom: 10,
            borderRadius: 5
          }}
          placeholder="Địa chỉ đã chọn"
          value={address}
          editable={false}
        />

        <Button
          title="Lấy vị trí hiện tại"
          onPress={() => {
            Geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                const currentCoordinate = { latitude, longitude };
                setCurrentPosition(currentCoordinate);

                try {
                  const response = await fetch(
                    `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=vi`
                  );
                  const data = await response.json();
                  
                  if (data.features && data.features.length > 0) {
                    const addressData = data.features[0].properties;
                    const formattedAddress = [
                      addressData.housenumber,
                      addressData.street,
                      addressData.district,
                      addressData.city,
                      addressData.country
                    ].filter(Boolean).join(', ');
                    
                    setAddress(formattedAddress);
                  }
                } catch (error) {
                  console.log(error);
                  Alert.alert('Error', 'Không thể lấy địa chỉ. Vui lòng thử lại.');
                }
              },
              (error) => {
                console.log(error);
                Alert.alert('Error', 'Không thể lấy vị trí. Vui lòng thử lại.');
              },
              { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
          }}
        />
      </View>
      
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 10.980724795723445,
          longitude: 106.67531866840427,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        onPress={handleMapPress}
      >
        {currentPosition && (
          <Marker
            coordinate={currentPosition}
            title="Vị trí đã chọn"
            description={address}
            pinColor="red"
          />
        )}
      </MapView>

      <View style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
      }}>
        <Button
          title="Xác nhận địa điểm"
          onPress={() => {
            if (currentPosition && address) {
              navigation.navigate('DetailAccountScreen', { 
                selectedAddress: address,
                shouldUpdateAddress: true,
                latitude: currentPosition.latitude,
                longitude: currentPosition.longitude,
              });
            } else {
              Alert.alert('Thông báo', 'Vui lòng chọn một địa điểm trên bản đồ');
            }
          }}
        />
      </View>
    </View>
  );
};

export default Map;