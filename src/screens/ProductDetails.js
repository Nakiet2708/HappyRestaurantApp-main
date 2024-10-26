import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../global/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';  
import CheckBox from '@react-native-community/checkbox';
import { useContext } from 'react';
import { useCart } from '../contexts/CartContext'; // Ensure correct import
import CartButton from '../components/CartButton';

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function ProductDetails({ route }) {
  const { product } = route.params;
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [Price, setPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(1);
  const navigation = useNavigation(); 
  const { addToCart } = useCart(); // Use the custom hook

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log('Fetching options for product:', product.id);
        console.log('Category ID:', product.categoryId);
        
        // Fetch product document first
        const productDoc = await firestore()
          .collection('menu')
          .doc(product.categoryId)
          .collection('product')
          .doc(product.id)
          .get();
        
        // console.log('Product data:', productDoc.data());

        if (productDoc.exists) {
          const optionsSnapshot = await firestore()
            .collection('menu')
            .doc(product.categoryId)
            .collection('product')
            .doc(product.id)
            .collection('option')
            .get();
          
          const optionsData = optionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('Fetched options:', optionsData);
          setOptions(optionsData);
        } else {
          console.log('Product document does not exist');
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, [product.id, product.categoryId]);

  const toggleOption = (optionId) => {
    setSelectedOptions(prevState => {
      const newState = { ...prevState, [optionId]: !prevState[optionId] };
      
      // Recalculate total price
      const newPrice = Object.keys(newState).reduce((sum, key) => {
        if (newState[key]) {
          const option = options.find(opt => opt.id === key);
          return sum + (option ? option.price : 0);
        }
        return sum;
      }, product.price);

      setPrice(newPrice);
      return newState;
    });
  };

  const incrementQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
  };

  const calculateTotalPrice = () => {
    const baseTotal = Price * quantity;
    const discountAmount = baseTotal * ((product.discountPrice ?? 0) / 100);
    return baseTotal - discountAmount;
  };

  const addToCartHandler = () => {
    const selectedOptionsList = Object.keys(selectedOptions)
      .filter(key => selectedOptions[key])
      .map(key => options.find(opt => opt.id === key).name);

    const baseTotal = Price * quantity;
    const discountAmount = baseTotal * ((product.discountPrice ?? 0) / 100);
    const ProductTotalPrice = baseTotal - discountAmount;

    const cartItem = {
      id: product.id,
      name: product.name,
      image: product.image,
      price: Price, 
      quantity: quantity,
      options: selectedOptionsList,
      discountAmount: discountAmount,
      ProductTotalPrice: ProductTotalPrice,
    };

    addToCart(cartItem);
  };

  return (
    <SafeAreaView style={styles.container}>   
      <CartButton />
      <ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back"
            type="material"
            size={30}
            color={colors.black}
          />
        </TouchableOpacity>
        
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>{product.describe}</Text>
          
          <View style={styles.headerTextView}>
            <Text style={styles.optionsTitle}>Choose your options:</Text>
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
            <Text>No options available for this product.</Text>
          )}

          <Text style={styles.totalPrice}>
          Tổng tiền: {formatPrice(calculateTotalPrice())} VNĐ
          </Text>
          
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Số lượng</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity onPress={decrementQuantity} style={styles.quantityButton}>
                <Icon name="remove" size={24} color={colors.lightgreen} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
                <Icon name="add" size={24} color={colors.lightgreen} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={addToCartHandler}
          >
            <Text style={styles.addToCartButtonText}>
              Thêm {quantity} {product.name} vào giỏ hàng 
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
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  basePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grey5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    marginRight: 10,
  },
  addToCartButton: {
    backgroundColor: colors.buttons,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  addToCartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.grey5,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 1,
    backgroundColor: colors.white,
    borderRadius: 90
  },
});
