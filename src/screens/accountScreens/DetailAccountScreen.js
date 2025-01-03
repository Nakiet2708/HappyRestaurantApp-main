import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors } from '../../global/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';

const DetailAccountScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    username: '',
    phone: '',
    email: '',
    gender: '',
    image: '',
    address: '',
    latitude: null,
    longitude: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const route = useRoute();

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userDoc = await firestore().collection('USERS').doc(user.email).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (route.params?.selectedAddress && route.params?.shouldUpdateAddress) {
      setUserData(prevData => ({
        ...prevData,
        address: route.params.selectedAddress,
        latitude: route.params.latitude,
        longitude: route.params.longitude,
      }));
      setIsAddressSelected(true);
      navigation.setParams({ 
        selectedAddress: undefined,
        shouldUpdateAddress: undefined,
        latitude: undefined,
        longitude: undefined,
      });
    }
  }, [route.params?.selectedAddress]);

  const handleSave = async () => {
    if (!userData.username || !userData.phone || !userData.address) {
      Alert.alert('Lỗi', 'Tên, số điện thoại và địa chỉ không được để trống.');
      return;
    }

    const userDataFromStorage = await AsyncStorage.getItem('user');
    if (userDataFromStorage) {
      const user = JSON.parse(userDataFromStorage);

      // Lọc ra các trường undefined
      const filteredUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      );

      await firestore().collection('USERS').doc(user.email).set(filteredUserData);
      setIsEditing(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'RootClientTabs' }],
      });
    }
  };

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel || response.error) {
        console.log('User cancelled image picker');
      } else {
        const { uri } = response.assets[0];
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

        // Lưu URL của ảnh hiện tại
        const currentImageUrl = userData.image;

        // Đặt đường dẫn lưu trữ trong thư mục "Avatar"
        const storageRef = storage().ref(`Avatar/${filename}`);
        const task = storageRef.putFile(uploadUri);

        try {
          await task;
          const url = await storageRef.getDownloadURL();
          
          // Xóa ảnh hiện tại nếu có
          if (currentImageUrl) {
            const currentImageRef = storage().refFromURL(currentImageUrl);
            await currentImageRef.delete();
          }

          setUserData({ ...userData, image: url });
          await firestore().collection('USERS').doc(userData.email).update({ image: url });
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../../assets/Image/nen.jpg')}
        style={styles.backgroundImage}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon
            name= "arrow-back"                 
            style={styles.backButton}
        />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          if (isEditing) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}>
          <Text style={styles.editButton}>{isEditing ? 'Lưu' : 'Sửa'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={isEditing ? handleChoosePhoto : null}>
          <Image
            source={userData.image ? { uri: userData.image } : require('../../../assets/Image/avatar-vo-danh.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Tên</Text>
      <TextInput
        style={styles.value}
        value={userData.username}
        editable={isEditing}
        onChangeText={(text) => setUserData({ ...userData, username: text })}
      />
      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput
        style={styles.value}
        value={userData.phone}
        editable={isEditing}
        onChangeText={(text) => setUserData({ ...userData, phone: text })}
      />
      <Text style={styles.label}>Địa chỉ email của bạn</Text>
      <TextInput
        style={styles.value}
        value={userData.email}
        editable={false} // Khóa trường email lại
      />
      <Text style={styles.label}>Địa chỉ</Text>
      <View style={styles.addressContainer}>
        <TextInput
          style={[styles.value, { flex: 1 }]}
          value={userData.address}
          editable={isEditing && isAddressSelected}
          onChangeText={(text) => setUserData({ ...userData, address: text })}
        />
        <TouchableOpacity 
          style={[styles.mapButton, !isEditing && styles.mapButtonDisabled]}
          onPress={() => isEditing && navigation.navigate('Map')}
        >
          <Icon 
            name="map" 
            size={24} 
            color={isEditing ? colors.buttons : '#ccc'} 
          />
        </TouchableOpacity>
      </View>
      <View >
        <Text style={styles.label}>Giới tính</Text>
        <Picker
          selectedValue={userData.gender}
          onValueChange={(itemValue) => setUserData({ ...userData, gender: itemValue })}
          enabled={isEditing}
          style={styles.picker}
        >
          <Picker.Item label="Chọn giới tính" value="" />
          <Picker.Item label="Nam" value="Nam" />
          <Picker.Item label="Nữ" value="Nữ" />
          <Picker.Item label="Khác" value="Khác" />
        </Picker>
      </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    
    backgroundColor: colors.white,
  },
  backgroundImage: {
    width: '100%',
    height: 200,
    position: 'absolute',
    top: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
    position: 'absolute',
    top: 0,
    
  },
  backButton: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white,
  },
  editButton: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },
  profileContainer: {
    marginTop: 130,
    width: 110,
    height: 110,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 20,
    color: '#333',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    marginLeft: 20,
    textAlign: 'left',
  },

  picker: {
    height: 50,
    width: '100%',
    marginLeft: 10,
    
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  mapButton: {
    padding: 10,
  },
  mapButtonDisabled: {
    opacity: 0.5,
  },
});

export default DetailAccountScreen;
