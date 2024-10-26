import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../global/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';


const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const AppointmentDetailScreen = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      const doc = await firestore().collection('Appointments').doc(appointmentId).get();
      if (doc.exists) {
        setAppointment(doc.data());
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  if (!appointment) {
    return <Text>Đang tải...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Chi Tiết Đơn Hàng</Text>
      </View>
      <Text style={styles.detail}>Thời gian: {appointment.dateTime.toDate().toLocaleDateString()}, {appointment.dateTime.toDate().toLocaleTimeString()}</Text>
      <Text style={styles.detail}>Tên người đặt: {appointment.username}</Text>
      <Text style={styles.detail}>Trạng thái: {appointment.status}</Text>

      <Text style={styles.sectionTitle}>Các món ăn đã đặt:</Text>
      {appointment.otherItems.map(item => (
        <View key={item.id} style={styles.item}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.nameProduct}>Tên: {item.name} {item.options && item.options.length > 0 ? `(${item.options.join(', ')})` : ''}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>Giá: {formatPrice(item.price)} VNĐ</Text>
              <Text style={styles.quantityText}>x{item.quantity}</Text>
            </View>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Phòng đã đặt:</Text>
      {appointment.tableItems.map(item => (
        <View key={item.id} style={styles.item}>
          <Image source={{ uri: item.image }} style={styles.imageT} />
          <View style={styles.textContainer}>
            <Text style={styles.nameProduct}>Tên: {item.name} {item.options && item.options.length > 0 ? `(${item.options.join(', ')})` : ''}</Text>
            <Text style={styles.texttime}>Thời gian: {item.timeSlot} Ngày: {item.date}</Text>
            <Text style={styles.price}>Giá: {formatPrice(item.price)} VNĐ</Text>
          </View>
        </View>
      ))}
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Giảm giá:</Text>
        <Text style={styles.TotalPrice}>0 VNĐ</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Tổng tiền:</Text>
        <Text style={styles.TotalPrice}>{formatPrice(appointment.totalPrice)} VNĐ</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.buttons,
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 70,
    
  },
  detail: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    padding: 16,
    marginBottom: -10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    padding: 5,
    color: colors.grey1,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 5,
    backgroundColor: colors.grey6,
    borderRadius: 5,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  imageT: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttons,
  },
  nameProduct: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.grey1,
  },
  quantityText: {
    fontSize: 20,
    color: colors.grey2,
    
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  texttime: {
    fontSize: 16,
    color: colors.grey1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.grey5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  TotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttons,
  },

});

export default AppointmentDetailScreen;
