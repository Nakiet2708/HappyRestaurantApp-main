import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../../global/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';  
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCart } from '../../contexts/CartContext'; // Import useCart
import CartButton from '../../components/CartButton';

const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return "0"; // Hoặc một giá trị mặc định khác
  }
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatTime = (date) => {
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatDate = (date) => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export default function TableDetail({ route }) {
  const { table } = route.params;
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [totalPrice, setTotalPrice] = useState(table.price || 0); // Đảm bảo giá trị mặc định là số
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // Đặt giá trị mặc định là null
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState('Hãy chọn thời gian');
  const [showTimeSlotPicker, setShowTimeSlotPicker] = useState(false);
  const navigation = useNavigation();
  const { cartItems, addToCart, removeFromCart } = useCart(); // Add cartItems here
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState([]);

  const timeSlots = [
    { label: 'Buổi sáng (7.00 - 10.30)', value: 'Buổi sáng' },
    { label: 'Buổi trưa (11.30 - 3.30)', value: 'Buổi trưa' },
    { label: 'Buổi chiều (4.30 - 8.30)', value: 'Buổi chiều' },
    
  ];

  const checkUnavailableTimeSlots = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      

      const querySnapshot = await firestore()
        .collection('Appointments')
        .get();


      const unavailableSlots = querySnapshot.docs.reduce((acc, doc) => {
        const items = doc.data().tableItems || [];

        items.forEach(item => {
          if (item.name === table.name && item.date === formattedDate) {
            acc.push(item.timeSlot);
          }
        });
        return acc;
      }, []);

      setUnavailableTimeSlots(unavailableSlots);
    
    } catch (error) {
      console.error('Error checking unavailable time slots:', error);
    }
  };

  const selectTimeSlot = (slot) => {
    if (!selectedDate) {
      Alert.alert("Thông báo", "Bạn hãy chọn ngày trước khi chọn thời gian");
      return;
    }
    if (unavailableTimeSlots.includes(slot)) {
      Alert.alert("Thông báo", "Thời gian này đã được đặt");
      return;
    }
    setTimeSlot(slot);
    setShowTimeSlotPicker(false);
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const optionsSnapshot = await firestore()
          .collection('restaurants')
          .doc(table.restaurantId)
          .collection('table')
          .doc(table.id)
          .collection('option')
          .get();
        
        const optionsData = optionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOptions(optionsData);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, [table.id, table.restaurantId]);

  useEffect(() => {
    const calculateTotalPrice = () => {
      const optionsTotal = Object.keys(selectedOptions).reduce((sum, key) => {
        if (selectedOptions[key]) {
          const option = options.find(opt => opt.id === key);
          return sum + (option ? option.price : 0);
        }
        return sum;
      }, 0);
      setTotalPrice((table.price || 0) + optionsTotal); // Đảm bảo giá trị mặc định là số
    };

    calculateTotalPrice();
  }, [selectedOptions, options, table.price]);

  const toggleOption = (optionId) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [optionId]: !prevState[optionId]
    }));
  };


  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || selectedDate;
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    if (currentDate) {
      checkUnavailableTimeSlots(currentDate);
    }
  };

  const addToCartHandler = async () => {
    if (!selectedDate) {
      Alert.alert("Thông báo", "Bạn hãy chọn ngày");
      return;
    }

    if (timeSlot === 'Hãy chọn thời gian') { // Kiểm tra nếu timeSlot chưa được chọn
      Alert.alert("Thông báo", "Bạn hãy chọn thời gian");
      return;
    }

    try {
      // Định dạng selectedDate thành "YYYY-MM-DD"
      const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : null;

      // Truy vấn Firestore để kiểm tra trùng lặp
      const querySnapshot = await firestore()
        .collection('Appointments')
        .get();

      const isDuplicate = querySnapshot.docs.some(doc => {
        const items = doc.data().tableItems || [];
        return items.some(item =>
          item.name === table.name &&
          item.date === formattedDate &&
          item.timeSlot === timeSlot
        );
      });

      if (isDuplicate) {
        Alert.alert("Thông báo", "Thời gian này đã được đặt");
        return;
      }

      const existingTableItem = cartItems.find(item => item.fromTableDetails);

      if (existingTableItem) {
        Alert.alert(
          "Thông báo",
          "Bạn có muốn xóa sản phẩm hiện tại trong giỏ hàng không?",
          [
            {
              text: "Hủy",
              style: "cancel"
            },
            {
              text: "Đồng ý",
              onPress: () => {
                removeFromCart(existingTableItem.id);
                addNewItemToCart();
              }
            }
          ]
        );
      } else {
        addNewItemToCart();
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trùng lặp:', error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi kiểm tra trùng lặp. Vui lòng thử lại.");
    }
  };

  const addNewItemToCart = () => {
    const selectedOptionsList = Object.keys(selectedOptions)
      .filter(key => selectedOptions[key])
      .map(key => options.find(opt => opt.id === key).name);

    const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : null;

    const cartItem = {
      id: table.id,
      name: table.name,
      image: table.image,
      price: totalPrice,
      options: selectedOptionsList,
      timeSlot: timeSlot,
      date: formattedDate,
      fromTableDetails: true,
      restaurantName: table.restaurantName,
    };

    console.log('Thêm vào giỏ hàng:', cartItem);
    addToCart(cartItem);
    console.log(`Đã thêm ${table.name} vào giỏ hàng. Tổng: ${formatPrice(totalPrice)} VNĐ`);
  };

  return (
    <SafeAreaView style={styles.container}>   
    <CartButton></CartButton>
      <ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back"
            size={30}
            color={colors.black}
          />
        </TouchableOpacity>
        
        <Image source={{ uri: table.image }} style={styles.image} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{table.name}</Text>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>
              Chọn ngày: {selectedDate ? formatDate(selectedDate) : "Hãy chọn ngày"}
            </Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Icon name="calendar-today" size={24} color={colors.black} marginBottom={12} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))} // Chỉ ngày tiếp
              />
            )}
          </View>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerLabel}>
              Chọn thời gian: {timeSlot}
            </Text>
            <TouchableOpacity onPress={() => setShowTimeSlotPicker(true)}>
              <Icon name="access-time" size={24} color={colors.black} marginBottom={12}/>
            </TouchableOpacity>
            <Modal
              transparent={true}
              visible={showTimeSlotPicker}
              animationType="slide"
              onRequestClose={() => setShowTimeSlotPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  {timeSlots.map((slot) => {
                    const isUnavailable = unavailableTimeSlots.includes(slot.value);
                    return (
                      <TouchableOpacity
                        key={slot.value}
                        onPress={() => selectTimeSlot(slot.value)}
                        disabled={isUnavailable}
                      >
                        <Text
                          style={[
                            styles.timeSlotOption,
                            isUnavailable && { color: 'red' }
                          ]}
                        >
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity onPress={() => setShowTimeSlotPicker(false)}>
                    <Text style={styles.closeButton}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          
          <View style={styles.headerTextView}>
            <Text style={styles.optionsTitle}>Chọn cách trang trí:</Text>
          </View>
          {options.length > 0 ? (
            options.map(option => (
              <View key={option.id} style={styles.optionItem}>
                <CheckBox
                  disabled={false}
                  value={selectedOptions[option.id] || false}
                  onValueChange={() => toggleOption(option.id)}
                  tintColors={{ true: colors.buttons, false: colors.grey3 }}
                />
                <Text style={styles.optionName}>{option.name}</Text>
                <Text style={styles.optionPrice}>{formatPrice(option.price)} VNĐ</Text>
              </View>
            ))
          ) : (
            <Text>No options available for this table.</Text>
          )}

          <Text style={styles.totalPrice}>Tổng tiền: {formatPrice(totalPrice)} VNĐ</Text>

          <TouchableOpacity style={styles.addToCartButton} onPress={addToCartHandler}>
            <Text style={styles.addToCartButtonText}>
              Thêm vào giỏ hàng
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.black,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.black,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    marginTop: 5,
  },
  optionPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: 'red',
  },
  headerTextView: {
    backgroundColor: colors.grey5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10, 
    borderRadius: 10,
  },
  timePickerContainer: {
    
    marginBottom: 10, 
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginRight: 10,
    
  },
  datePickerContainer: {
    
    marginBottom: 10, 
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginRight: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 1,
    backgroundColor: colors.white,
    borderRadius: 90
  },
  timeSlotPicker: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 2,
  },

  closeButton: {
    marginTop: 20,
    fontSize: 18,
    color: colors.buttons,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  timeSlotOption: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey5,
    width: '100%',
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: colors.buttons,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  addToCartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
});
