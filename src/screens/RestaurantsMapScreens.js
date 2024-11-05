import React, { useEffect, useState, useRef } from 'react';
import { View, PermissionsAndroid, Platform, Alert, TextInput, Button, Image, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';

const GEOAPIFY_API_KEY = 'be8283f0ca404169924653620c942bfa';

const RestaurantsMapScreen = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [destination, setDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const mapRef = useRef(null);
  const [storeLocations, setStoreLocations] = useState([]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const route = useRoute();

  // Thêm hằng số cho khoảng cách tối đa (đơn vị: km)
  const MAX_DISTANCE = 100; // Có thể điều chỉnh số này theo nhu cầu

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
        getCurrentPosition(); // iOS automatically handles permissions
      }
    };

    const getCurrentPosition = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ latitude, longitude });
        },
        (error) => {
          console.log(error);
          Alert.alert('Error', 'Unable to retrieve location. Please try again.');
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
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

  // Thêm hàm tính khoảng cách giữa 2 điểm
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Khoảng cách tính bằng km
  };

  // Sửa lại hàm handleMapPress
  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setCurrentPosition(coordinate);
    
    // Tìm cơ sở gần nhất
    let nearestStore = null;
    let shortestDistance = Infinity;
    
    storeLocations.forEach(store => {
      const distance = calculateDistance(
        coordinate.latitude,
        coordinate.longitude,
        parseFloat(store.latitude),
        parseFloat(store.longitude)
      );
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStore = store;
      }
    });

    if (nearestStore) {
      // Kiểm tra khoảng cách
      if (shortestDistance > MAX_DISTANCE) {
        Alert.alert(
          'Thông báo',
          `Không thể tìm đường đi vì khoảng cách quá xa (${shortestDistance.toFixed(2)} km). Vui lòng chọn địa điểm trong bán kính ${MAX_DISTANCE}km.`
        );
        return;
      }

      const storeCoordinate = {
        latitude: parseFloat(nearestStore.latitude),
        longitude: parseFloat(nearestStore.longitude)
      };
      setDestination(storeCoordinate);
      
      try {
        // Lấy và vẽ đường đi
        const route = await getRouteFromGeoapify(coordinate, storeCoordinate);
        if (!route || route.length === 0) {
          Alert.alert(
            'Thông báo',
            'Không thể tìm được đường đi đến địa điểm này. Vui lòng thử địa điểm khác.'
          );
          return;
        }
        setRouteCoordinates(route);
        
        // Hiển thị thông tin
        Alert.alert(
          'Cơ sở gần nhất',
          `${nearestStore.restaurantName}\n${nearestStore.businessAddress}\nKhoảng cách: ${shortestDistance.toFixed(2)} km`
        );
      } catch (error) {
        console.error('Lỗi khi tìm đường:', error);
        Alert.alert(
          'Lỗi',
          'Không thể tìm được đường đi đến địa điểm này. Vui lòng thử lại sau.'
        );
      }
    }

    // Chuyển đổi tọa độ thành địa chỉ cho điểm xuất phát
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

  const getRouteFromGeoapify = async (start, end) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${start.latitude},${start.longitude}|${end.latitude},${end.longitude}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Chuyển đổi coordinates từ Geoapify ([lon, lat]) sang định dạng của React Native Maps (latitude, longitude)
        const routeCoordinates = data.features[0].geometry.coordinates[0].map(point => ({
          latitude: point[1],
          longitude: point[0]
        }));
        
        // Vẽ đường đi bằng Polyline
        return routeCoordinates;
      }
      return []; // Trả về mảng rỗng nếu không có dữ liệu
    } catch (error) {
      console.error('Error getting route:', error);
      Alert.alert('Error', 'Không thể lấy đường đi. Vui lòng thử lại.');
      return []; // Trả về mảng rỗng nếu có lỗi
    }
  };

  useEffect(() => {
    const fetchStoreLocations = async () => {
      try {
        const snapshot = await firestore()
          .collection('restaurants')
          .get();
        
        if (!snapshot.empty) {
          const locations = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Đảm bảo latitude và longitude là số
              latitude: parseFloat(data.latitude) || 0,
              longitude: parseFloat(data.longitude) || 0
            };
          }).filter(location => 
            // Lọc ra những địa điểm có tọa độ hợp lệ
            !isNaN(location.latitude) && 
            !isNaN(location.longitude) &&
            location.latitude !== 0 &&
            location.longitude !== 0
          );
          
          if (locations.length > 0) {
            setStoreLocations(locations);
          } else {
            console.warn('Không tìm thấy địa điểm nào có tọa độ hợp lệ.');
            Alert.alert('Thông báo', 'Không có dữ liệu cửa hàng hợp lệ.');
          }
        } else {
          console.warn('Không tìm thấy vị trí nhà hàng nào trong cơ sở dữ liệu.');
          Alert.alert('Thông báo', 'Không có dữ liệu cửa hàng nào được tìm thấy.');
        }
      } catch (error) {
        if (error instanceof AggregateError) {
          error.errors.forEach(err => console.error('Lỗi Firestore:', err));
        } else {
          console.error('Lỗi khi lấy vị trí cửa hàng:', error);
        }
        Alert.alert('Lỗi', 'Không thể lấy dữ liệu cửa hàng từ cơ sở dữ liệu');
      }
    };

    fetchStoreLocations();
  }, []);

  const getAddressSuggestions = async (text) => {
    try {
      setAddress(text);
      if (text.length < 3) { // Chỉ tìm kiếm khi có ít nhất 3 ký tự
        setAddressSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&format=json&apiKey=${GEOAPIFY_API_KEY}&lang=vi&filter=countrycode:vn`
      );
      
      const data = await response.json();
      
      if (data.results) {
        setAddressSuggestions(data.results);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const handleSelectAddress = async (suggestion) => {
    const { lat, lon } = suggestion;
    const selectedPosition = {
      latitude: lat,
      longitude: lon
    };
    
    setCurrentPosition(selectedPosition);
    setAddress(suggestion.formatted);
    setShowSuggestions(false);
    
    let nearestStore = null;
    let shortestDistance = Infinity;
    
    storeLocations.forEach(store => {
      const distance = calculateDistance(
        lat,
        lon,
        parseFloat(store.latitude),
        parseFloat(store.longitude)
      );
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStore = store;
      }
    });

    if (nearestStore) {
      // Kiểm tra khoảng cách
      if (shortestDistance > MAX_DISTANCE) {
        Alert.alert(
          'Thông báo',
          `Không thể tìm đường đi vì khoảng cách quá xa (${shortestDistance.toFixed(2)} km). Vui lòng chọn địa điểm trong bán kính ${MAX_DISTANCE}km.`
        );
        return;
      }

      const storeCoordinate = {
        latitude: parseFloat(nearestStore.latitude),
        longitude: parseFloat(nearestStore.longitude)
      };
      setDestination(storeCoordinate);
      
      try {
        const route = await getRouteFromGeoapify(selectedPosition, storeCoordinate);
        if (!route || route.length === 0) {
          Alert.alert(
            'Thông báo',
            'Không thể tìm được đường đi đến địa điểm này. Vui lòng thử địa điểm khác.'
          );
          return;
        }
        setRouteCoordinates(route);
        
        Alert.alert(
          'Cơ sở gần nhất',
          `${nearestStore.restaurantName}\n${nearestStore.businessAddress}\nKhoảng cách: ${shortestDistance.toFixed(2)} km`
        );
      } catch (error) {
        console.error('Lỗi khi tìm đường:', error);
        Alert.alert(
          'Lỗi',
          'Không thể tìm được đường đi đến địa điểm này. Vui lòng thử lại sau.'
        );
      }
    }
  };

  return (
    <View style={{ 
      flex: 1,
      backgroundColor: 'white',
    }}>
      <View style={{ margin: 10 }}>
        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            paddingLeft: 8,
            marginBottom: showSuggestions ? 0 : 10,
            borderRadius: 5
          }}
          placeholder="Nhập địa chỉ"
          value={address}
          onChangeText={(text) => getAddressSuggestions(text)}
        />
        
        {/* Danh sách gợi ý địa chỉ */}
        {showSuggestions && addressSuggestions.length > 0 && (
          <View style={{
            maxHeight: 200,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: 'gray',
            marginBottom: 10,
            borderRadius: 5
          }}>
            {addressSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee'
                }}
                onPress={() => handleSelectAddress(suggestion)}
              >
                <Text>{suggestion.formatted}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Button
          title="Lấy vị trí hiện tại"
          onPress={async () => {
            Geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                const currentCoordinate = { latitude, longitude };
                setCurrentPosition(currentCoordinate);

                // Tìm cơ sở gần nhất
                let nearestStore = null;
                let shortestDistance = Infinity;
                
                storeLocations.forEach(store => {
                  const distance = calculateDistance(
                    latitude,
                    longitude,
                    parseFloat(store.latitude),
                    parseFloat(store.longitude)
                  );
                  
                  if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestStore = store;
                  }
                });

                if (nearestStore) {
                  const storeCoordinate = {
                    latitude: parseFloat(nearestStore.latitude),
                    longitude: parseFloat(nearestStore.longitude)
                  };
                  setDestination(storeCoordinate);
                  
                  // Lấy và vẽ đường đi
                  const route = await getRouteFromGeoapify(currentCoordinate, storeCoordinate);
                  setRouteCoordinates(route);
                  
                  // Hiển thị thông tin
                  Alert.alert(
                    'Cơ sở gần nhất',
                    `${nearestStore.restaurantName}\n${nearestStore.businessAddress}\nKhoảng cách: ${shortestDistance.toFixed(2)} km`
                  );
                }

                // Chuyển đổi tọa độ thành địa chỉ cho điểm xuất phát
                try {
                  const response = await fetch(
                    `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=vi`
                  );
                  const data = await response.json();
                  
                  if (data.features && data.features.length > 0) {
                    const addressData = data.features[0].properties;
                    // Tạo địa chỉ đầy đủ từ dữ liệu
                    const formattedAddress = [
                      addressData.housenumber,
                      addressData.street,
                      addressData.district,
                      addressData.city,
                      addressData.country
                    ].filter(Boolean).join(', ');
                    
                    setAddress(formattedAddress); // Cập nhật ô nhập địa chỉ
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
            title={"Vị trí xuất phát"}
            description={address}
            pinColor="red"
          />
        )}
        
        {destination && (
          <Marker
            coordinate={destination}
            title={"Điểm đến"}
            pinColor="blue"
          />
        )}

        {currentPosition && destination && routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={3}
            strokeColor="blue"
          />
        )}

        {storeLocations.map(store => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.latitude,  // Đã là số, không cần parseFloat
              longitude: store.longitude // Đã là số, không cần parseFloat
            }}
            title={store.restaurantName}
            description={store.businessAddress}
            pinColor="green"
          />
        ))}
      </MapView>

      {/* Thêm nút xác nhận ở dưới */}
      <View style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
      }}>
        
      </View>
    </View>
  );
};


export default RestaurantsMapScreen;