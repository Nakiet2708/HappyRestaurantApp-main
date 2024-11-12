import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, ScrollView, Platform, NativeModules, DeviceEventEmitter, Clipboard } from 'react-native';
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
  const { totalPrice } = route.params;
  const [lastTransactionId, setLastTransactionId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [userInfo, setUserInfo] = useState({});

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
          const { username, phone ,address, latitude, longitude} = userDoc.data();
          
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
            address,
            latitude,
            longitude,
            status,
            totalPrice, 
          };

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
      await handleZaloPayPayment();
    } else if (selectedMethod === 'MoMo') {
      await onPressMoMo();
    } else {
      Alert.alert('Error', 'Please select a payment method.');
    }
  };

  const handleZaloPayPayment = async () => {
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

      await new Promise(resolve => setTimeout(resolve, 3000));

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

  const onPressMoMo = async () => {
    let jsonData = {
      enviroment,
      action: "gettoken",
      merchantname,
      merchantcode,
      merchantnamelabel: merchantNameLabel,
      description: billdescription,
      amount: 1000,
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
      if (response && response.status == 0) {
        Alert.alert('Thông báo', 'Thanh toán thành công.');
        await handlePaymentSuccess();
          setCartItems([]);
          navigation.goBack();
        // Handle success
      } else {
        // Handle error
      }
    } catch (ex) {}
  }

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
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tên khách hàng</Text>
            <Text style={styles.detailValue}>{userInfo.username}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tiền</Text>
            <Text style={styles.detailValue}>{totalPrice}đ</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số điện thoại</Text>
            <Text style={styles.detailValue}>{userInfo.phone}</Text>
          </View>
          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <Text style={styles.detailLabel}>Địa chỉ</Text>
            <Text style={styles.detailValue}>{userInfo.address}</Text>
          </View>

        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          // onPress={handlePaymentSuccess}
        >
          <Text style={styles.payButtonText}>Thanh toán</Text>
        </TouchableOpacity>
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
});
