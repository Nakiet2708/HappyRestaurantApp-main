import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, ScrollView, Platform, NativeModules, DeviceEventEmitter, Clipboard, TextInput, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../contexts/CartContext';
import { colors } from '../global/styles';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import RNMomosdk from 'react-native-momosdk';

// Cấu hình ứng dụng momo
const RNMomosdkModule = NativeModules.RNMomosdk;
const merchantname = "CGV Cinemas";
const merchantcode = "CGV01";
const merchantNameLabel = "Nhà cung cấp";
const billdescription = "Mua đồ ăn nhà hàng Happy";
const enviroment = "1"; // "0": SANBOX , "1": PRODUCTION

// Cấu hình ứng dụng ZaloPay
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  query_endpoint: "https://sb-openapi.zalopay.vn/v2/query"
};

export default function PaymentOptionsScreen({ navigation, route }) {
  const { cartItems, setCartItems } = useCart();
  const [totalAmount] = useState(route.params.totalPrice);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [isUsingRecipient, setIsUsingRecipient] = useState(false);
  const [recipient, setRecipient] = useState({
    name: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null
  });
  const [isRecipientModalVisible, setIsRecipientModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const userDoc = await firestore().collection('USERS').doc(user.email).get();
          if (userDoc.exists) {
            setUserInfo(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    DeviceEventEmitter.addListener('RCTMoMoNoficationCenterRequestTokenReceived', (response) => {
      try {
        console.log("<MoMoPay>Listen.Event::" + JSON.stringify(response));
        if (response && response.status == 0) {
          // Handle success
        } else {
          // Handle error
        }
      } catch (ex) {}
    });

    DeviceEventEmitter.addListener('RCTMoMoNoficationCenterRequestTokenState', (response) => {
      console.log("<MoMoPay>Listen.RequestTokenState:: " + response.status);
    });
  }, []);

  useEffect(() => {
    if (route.params?.selectedAddress && route.params?.shouldUpdateAddress) {
      setRecipient(prev => ({
        ...prev,
        address: route.params.selectedAddress,
        latitude: route.params.latitude,
        longitude: route.params.longitude,
      }));
      setIsRecipientModalVisible(true);
      navigation.setParams({ 
        selectedAddress: undefined,
        shouldUpdateAddress: undefined,
        latitude: undefined,
        longitude: undefined,
      });
    }
  }, [route.params?.selectedAddress]);

  const paymentMethods = [
    {
      name: 'ZaloPay',
      logo: require('../../assets/Image/zalopay.png'),
    },
    {
      name: 'MoMo',
      logo: require('../../assets/Image/momo.png'),
    },
  ];

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handlePaymentSuccess = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userDoc = await firestore().collection('USERS').doc(user.email).get();
        
        if (userDoc.exists) {
          const { username, phone, address, latitude, longitude } = userDoc.data();
          
          const dateTime = new Date();
          const tableItems = cartItems.filter(item => item.fromTableDetails);
          const otherItems = cartItems.filter(item => !item.fromTableDetails);
          const status = tableItems.length > 0 ? "Chưa nhận phòng" : "Chưa nhận hàng";

          const appointmentData = {
            dateTime,
            email: user.email,
            username,
            phone,
            tableItems,
            otherItems,
            status,
            totalPrice: totalAmount,
          };

          // Thêm thông tin người nhận nếu có
          if (isUsingRecipient) {
            appointmentData.recipientName = recipient.name;
            appointmentData.recipientPhone = recipient.phone;
            appointmentData.address = recipient.address;
            appointmentData.latitude = recipient.latitude;
            appointmentData.longitude = recipient.longitude;
          } else {
            appointmentData.address = address;
            appointmentData.latitude = latitude;
            appointmentData.longitude = longitude;
          }

          await firestore().collection('Appointments').add(appointmentData);
          console.log('Dữ liệu cuộc hẹn đã được thêm thành công vào Firestore');
        }
      }
    } catch (error) {
      console.error('Lỗi khi thêm dữ liệu cuộc hẹn vào Firestore:', error);
    }
  };

  const handlePayment = async () => {
    if (selectedMethod === 'ZaloPay') {
      await handleZaloPayPayment(totalAmount);
    } else if (selectedMethod === 'MoMo') {
      await onPressMoMo(totalAmount);
    } else {
      Alert.alert('Error', 'Please select a payment method.');
    }
  };

  const handleZaloPayPayment = async (totalPrice) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        Alert.alert('Error', 'User data not found.');
        return;
      }
      const user = JSON.parse(userData);

      // Lấy thông tin người dùng từ Firestore
      const userDoc = await firestore().collection('USERS').doc(user.email).get();
      if (!userDoc.exists) {
        Alert.alert('Error', 'User not found in database.');
        return;
      }
      const { username } = userDoc.data();

      const transID = Math.floor(Math.random() * 1000000);
      const randomTransId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const app_trans_id = `${moment().format('YYMMDD')}_${randomTransId}`;

      const order = {
        app_id: 2553,
        app_user: username,
        app_trans_id: app_trans_id,
        app_time: Date.now(),
        amount: totalPrice,
        item: JSON.stringify(cartItems),
        description: "Lazada - Thanh toán đơn hàng #123456",
        embed_data: JSON.stringify({ promotioninfo: "", merchantinfo: "du lieu rieng cua ung dung" }),
        bank_code: "zalopayapp",
        callback_url: "https://yourdomain.com/callback",
        mac: "c8f49d523336f0a182586a70b71c20da96 4d37954711de9273152b500df74c0d"
      };

      // Tạo chữ ký HMAC
      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      console.log('Order Data:', order);

      // Gửi yêu cầu thanh toán bằng fetch
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      const responseData = await response.json();
      console.log('Response Data:', responseData);

      if (responseData.return_code === 1) {
        // Lưu toàn bộ thông tin giao dịch
        const transactionInfo = {
          app_trans_id: app_trans_id,
          zp_trans_token: responseData.zp_trans_token,
          mac: order.mac
        };
        await AsyncStorage.setItem('transaction_info', JSON.stringify(transactionInfo));
        
        if (responseData.order_url) {
          try {
            if (await InAppBrowser.isAvailable()) {
              await InAppBrowser.open(responseData.order_url, {
                // Các tùy chọn khác nếu cần
                dismissButtonStyle: 'cancel',
                preferredBarTintColor: '#453AA4',
                preferredControlTintColor: 'white',
                readerMode: false,
                animated: true,
                modalPresentationStyle: 'fullScreen',
                modalTransitionStyle: 'coverVertical',
                modalEnabled: true,
                enableBarCollapsing: false,
              });
              console.log('Success', 'Payment page opened in browser.');
            } else {
              console.log('Error', 'InAppBrowser is not available');
            }
          } catch (error) {
            console.error('Error opening URL:', error);
          }
        } else {
          console.log('Error', 'Payment URL not provided');
        }

        // Hiển thị thông báo với nút kiểm tra
        Alert.alert(
          'Thông báo',
          'Vui lòng hoàn tất thanh toán trên ứng dụng ZaloPay và sau đó kiểm tra trạng thái.',
          [
            {
              text: 'Kiểm tra trạng thái thanh toán',
              onPress: () => checkZaloPayStatus(5), // Truyền số lần thử tối đa
            },
          ],
          { cancelable: false }
        );
      } else {
        console.log('Error', 'Payment failed!');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      if (error instanceof Error) {
        console.log('Error', `Payment error: ${error.message}`);
      } else {
        console.log('Error', 'An unknown error occurred.');
      }
    }
  };

  const checkZaloPayStatus = async (remainingAttempts = 5) => {
    try {
      if (remainingAttempts <= 0) {
        Alert.alert(
          'Thông báo',
          'Không thể xác nhận trạng thái thanh toán. Vui lòng liên hệ bộ phận hỗ trợ.'
        );
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const transactionInfoStr = await AsyncStorage.getItem('transaction_info');
      const transactionInfo = JSON.parse(transactionInfoStr);

      if (!transactionInfo) {
        throw new Error('Không tìm thấy thông tin giao dịch');
      }

      const { app_trans_id } = transactionInfo;

      // Tạo chữ ký MAC theo tài liệu ZaloPay
      const data = config.app_id + "|" + app_trans_id + "|" + config.key1;
      const mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      console.log('Check Status Data:', {
        app_id: config.app_id,
        app_trans_id,
        mac
      });

      const response = await fetch(config.query_endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          app_id: config.app_id,
          app_trans_id: app_trans_id,
          mac: mac
        }).toString()
      });

      const result = await response.json();
      console.log('ZaloPay Status Response:', result);

      let statusMessage = '';
      if (result.return_code === 1 || result.return_code === '1') {
          statusMessage = 'Thanh toán thành công';
          await handlePaymentSuccess();
          setCartItems([]);
          navigation.goBack();
      } else if (result.return_code === 3 || result.return_code === '3') {
          statusMessage = 'Giao dịch đang xử lý. Vui lòng đợi...';
          setTimeout(() => checkZaloPayStatus(remainingAttempts - 1), 5000);
      } else if (result.return_code === 2 || result.return_code === '2') {
          statusMessage = 'Thanh toán thất bại';
      } else {
          statusMessage = 'Đang kiểm tra trạng thái thanh toán';
          setTimeout(() => checkZaloPayStatus(remainingAttempts - 1), 5000);
      }

      Alert.alert('Trạng thái giao dịch', `${statusMessage}\n\nChi tiết: ${result.return_message}`);
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái:', error);
      setTimeout(() => checkZaloPayStatus(remainingAttempts - 1), 5000);
    }
  };

  const onPressMoMo = async (totalPrice) => {
    let jsonData = {
      enviroment,
      action: "gettoken",
      merchantname,
      merchantcode,
      merchantnamelabel: merchantNameLabel,
      description: billdescription,
      amount: totalPrice,
      orderId: "ID20181123192300",
      orderLabel: "Ma don hang",
      appScheme: "momocgv20170101"
    };

    console.log("data_request_payment " + JSON.stringify(jsonData));
    if (Platform.OS === 'android') {
      let dataPayment = await RNMomosdk.requestPayment(jsonData);
      momoHandleResponse(dataPayment);
    } else {
      RNMomosdk.requestPayment(jsonData);
    }
  };

  async function momoHandleResponse(response) {
    try {
      console.log('Phản hồi từ MoMo:', response);
      
      if (response && response.status === 0) {
        // Thanh toán thành công
        Alert.alert(
          'Thông báo',
          'Bạn đã thanh toán thành công!!.'
        );
        await handlePaymentSuccess();
        setCartItems([]);
        navigation.goBack();
      } else {
        // Xử lý các trường hợp lỗi
        let errorMessage = 'Thanh toán thất bại';
        switch (response?.status) {
          case 1: errorMessage = 'Giao dịch đã bị hủy'; break;
          case 2: errorMessage = 'Lỗi kết nối'; break;
          // ... các trường hợp khác
        }
        Alert.alert('Thông báo', errorMessage);
      }
    } catch (error) {
      console.error('Lỗi thanh toán MoMo:', error);
      Alert.alert(
        'Lỗi',
        'Đã xảy ra lỗi trong quá trình xử lý thanh toán. Vui lòng thử lại sau.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }

  const handleRecipientSubmit = () => {
    if (!recipient.name || !recipient.phone || !recipient.address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin người nhận');
      return;
    }
    setIsUsingRecipient(true);
    setIsRecipientModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán an toàn</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Chọn phương thức thanh toán:</Text>
        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paymentMethod,
                selectedMethod === method.name && styles.selectedMethod,
              ]}
              onPress={() => handleSelectMethod(method.name)}
            >
              <Text style={styles.methodName}>{method.name}</Text>
              <Image source={method.logo} style={styles.methodLogo} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.detailTitle}>CHI TIẾT GIAO DỊCH</Text>
        <View style={styles.transactionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dịch vụ</Text>
            <Text style={styles.detailValue}>Nhà Hàng HAPPY</Text>
          </View>
          
          {isUsingRecipient && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Người nhận</Text>
              <Text style={styles.detailValue}>{recipient.name}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tên khách hàng</Text>
            <Text style={styles.detailValue}>{userInfo.username}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tiền</Text>
            <Text style={styles.detailValue}>{totalAmount}đ</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số điện thoại</Text>
            <Text style={styles.detailValue}>
              {isUsingRecipient ? recipient.phone : userInfo.phone}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <Text style={styles.detailLabel}>Địa chỉ</Text>
            <Text style={styles.detailValue}>
              {isUsingRecipient ? recipient.address : userInfo.address}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.recipientButton}
          onPress={() => setIsRecipientModalVisible(true)}
        >
          <Text style={styles.recipientButtonText}>
            {isUsingRecipient ? 'Thay đổi người nhận' : 'Thêm người nhận khác'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePayment(totalAmount)}
          // onPress={() => handlePaymentSuccess()}
        >
          <Text style={styles.payButtonText}>Thanh toán</Text>
        </TouchableOpacity>

        <Modal
          visible={isRecipientModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsRecipientModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thông tin người nhận</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Tên người nhận"
                value={recipient.name}
                onChangeText={(text) => setRecipient({...recipient, name: text})}
              />

              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={recipient.phone}
                keyboardType="phone-pad"
                onChangeText={(text) => setRecipient({...recipient, phone: text})}
              />

              <View style={styles.addressContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Địa chỉ"
                  value={recipient.address}
                  editable={false}
                />
                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => {
                    setIsRecipientModalVisible(false);
                    navigation.navigate('Map', {
                      previousScreen: 'PaymentOptions'
                    });
                  }}
                >
                  <Icon name="map" size={24} color={colors.buttons} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsRecipientModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleRecipientSubmit}
                >
                  <Text style={styles.modalButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.buttons,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    color: colors.white,
  },
  scrollViewContent: {
    paddingBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginLeft: 10,
    marginTop: 5,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 8,
    width: '45%',
  },
  selectedMethod: {
    backgroundColor: '#e0f7fa',
  },
  methodName: {
    fontSize: 16,
    color: 'black',
  },
  methodLogo: {
    width: 40,
    height: 40,
  },
  transactionDetails: {
    padding: 10,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.black,
    marginLeft: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexWrap: 'wrap',
  },
  lastDetailRow: {
    borderBottomWidth: 0, // Bỏ viền gạch chân
  },
  detailLabel: {
    fontSize: 16,
    color: colors.black,
    flex: 1, 
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    textAlign: 'right', 
  },
  payButton: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: colors.buttons,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
  },
  recipientButton: {
    backgroundColor: colors.grey5,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  recipientButtonText: {
    color: colors.grey1,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey4,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.grey5,
  },
  confirmButton: {
    backgroundColor: colors.buttons,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButton: {
    padding: 10,
    marginLeft: 10,
  },
});
