import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheckBox from '@react-native-community/checkbox';
import { colors } from '../global/styles';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return "0"; // Hoặc một giá trị mặc định khác
  }
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function ShoppingCartScreen() {
  const { cartItems, setCartItems, removeFromCart } = useCart();
  const [subtotal, setSubtotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const totalDiscount = cartItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const total = subtotal - totalDiscount;
    setSubtotal(subtotal);
    setTotalPrice(total);
  }, [cartItems]);

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(cartItems.map(item => 
      item.fromTableDetails ? item : { ...item, selected: newSelectAll }
    ));
  };

  const toggleSelectItem = (id) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const deleteSelectedItems = () => {
    cartItems.forEach(item => {
      if (item.selected) {
        removeFromCart(item.id);
      }
    });
  };

  const deleteItem = (id) => {
    removeFromCart(id);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {!item.fromTableDetails && (
        <CheckBox
          disabled={false}
          value={item.selected}
          onValueChange={() => toggleSelectItem(item.id)}
          tintColors={{ true: colors.buttons, false: colors.grey3 }}
        />
      )}
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>
          {item.name} {item.options.length > 0 && `(${item.options.join(', ')})`}
        </Text>
        {item.fromTableDetails && (
          <Text style={styles.dateTimeText}>
            {`${item.timeSlot} ${item.date}`}
          </Text>
        )}
        <View style={styles.priceQuantityContainer}>
          <Text style={styles.priceText}>{formatPrice(item.price)} VNĐ</Text>
          {item.fromTableDetails ? (
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Icon name="delete" size={24} color={colors.grey2} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.quantityText}>x{item.quantity}</Text>
          )}
        </View>
      </View>
    </View>
  );

  const handleCheckout = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userDoc = await firestore().collection('USERS').doc(user.email).get();
        
        if (userDoc.exists) {
          const { username, phone } = userDoc.data();
          
          if (!username || !phone) {
            Alert.alert("Thông báo", "Bạn hãy nhập đầy đủ thông tin để thanh toán");
            return;
          }
        }
      }
      navigation.navigate('PaymentOptions', { totalPrice });
    } catch (error) {
      console.error('Lỗi khi kiểm tra thông tin người dùng:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Giỏ Hàng</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={cartItems.filter(item => item.fromTableDetails)}
          renderItem={renderCartItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
        />
        <View style={styles.selectAllContainer}>
          <CheckBox
            disabled={false}
            value={selectAll}
            onValueChange={toggleSelectAll}
            tintColors={{ true: colors.buttons, false: colors.grey3 }}
          />
          <Text style={styles.selectAllText}>
            {cartItems.some(item => item.fromTableDetails) ? 
              `Đặt thêm (${cartItems.length} món)` : 
              `Tất cả (${cartItems.length} món ăn)`}
          </Text>
          <TouchableOpacity onPress={deleteSelectedItems} style={styles.deleteButton}>
            <Icon name="delete" size={24} color={colors.grey2} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={cartItems.filter(item => !item.fromTableDetails)}
        renderItem={renderCartItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Giá gốc:</Text>
        <Text style={styles.totalPrice}>{formatPrice(subtotal)} VNĐ</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Giảm giá:</Text>
        <Text style={styles.totalPrice}>{formatPrice(cartItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0))} VNĐ</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Tổng tiền:</Text>
        <Text style={styles.totalPrice}>{formatPrice(totalPrice)} VNĐ</Text>
      </View>
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    color: colors.black,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  selectAllText: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 8,
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    marginBottom: 10, // Add margin to separate items
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    color: colors.grey2,
    marginBottom: 4,
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.buttons,
  },
  quantityText: {
    fontSize: 20,
    color: colors.grey2,
  },
  deleteButton: {
    padding: 8,
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
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttons,
  },
  checkoutButton: {
    backgroundColor: colors.buttons,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateTimeText: {
    fontSize: 14,
    color: colors.grey2,
    marginBottom: 4,
  },
});
