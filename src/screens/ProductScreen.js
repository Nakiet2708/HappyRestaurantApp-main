import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import SearchComponent from '../components/SearchCompoment';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Hàm định dạng giá tiền
const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function ProductScreen({ route }) {
    const [products, setProducts] = useState([]);
    const { categoryId, categoryName } = route.params;
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsCollection = await firestore()
                    .collection('menu')
                    .doc(categoryId)
                    .collection('product')
                    .get();
                const productsList = productsCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsList);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [categoryId]);

    const renderProductItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.productItem}
            onPress={() => navigation.navigate('ProductDetails', { 
                product: {
                    ...item,
                    categoryId: route.params.categoryId // Đảm bảo categoryId được truyền
                }
            })}
        >
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>Giá tiền: {formatPrice(item.price)} VNĐ</Text>
            </View>
            <Image source={{ uri: item.image }} style={styles.productImage} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SearchComponent/>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
            <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.productsContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    categoryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 15,
        marginTop: 20,
        marginBottom: 10,
    },
    productsContainer: {
        paddingHorizontal: 15,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 15,
    },
    productInfo: {
        flex: 1,
        marginRight: 15,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
    },
    productImage: {
        width: 80,
        height: 60,
        borderRadius: 5,
    },
});