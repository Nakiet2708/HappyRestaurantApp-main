import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../global/styles';
import { useNavigation } from '@react-navigation/native';

// Hàm định dạng giá tiền
const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function Menu({ restaurantId }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const menuSnapshot = await firestore().collection('menu').get();
                const categoriesList = menuSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCategories(categoriesList);
            } catch (error) {
                console.error('Error fetching menu categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const fetchProducts = async (categoryId) => {
        try {
            const productsSnapshot = await firestore()
                .collection('menu')
                .doc(categoryId)
                .collection('product')
                .get();
            const productsList = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsList);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const renderCategoryItem = ({ item }) => (
        <View>
            <TouchableOpacity
                style={[styles.categoryItem, selectedCategory === item.id && styles.selectedCategoryItem]}
                onPress={() => {
                    setSelectedCategory(prevCategory => prevCategory === item.id ? null : item.id);
                    if (selectedCategory !== item.id) {
                        fetchProducts(item.id);
                    }
                }}
            >
                <Text style={[styles.categoryText, selectedCategory === item.id && styles.selectedCategoryText]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
            {selectedCategory === item.id && (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(product) => product.id}
                    scrollEnabled={false}
                />
            )}
        </View>
    );

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productItem}
            onPress={() => navigation.navigate('ProductDetails', { 
                product: {
                    ...item,
                    categoryId: selectedCategory
                }
            })}
        >
            <View style={styles.productContent}>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
                        {item.name}
                    </Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>{formatPrice(item.price)} VNĐ</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    categoryItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.grey5,
        backgroundColor: colors.white,
        elevation: 2,
        marginVertical: 1,
    },
    selectedCategoryItem: {
        backgroundColor: colors.cardbackground,
        borderLeftWidth: 4,
        borderLeftColor: colors.buttons,
    },
    categoryText: {
        fontSize: 16,
        color: colors.grey1,
        fontWeight: 'bold',
    },
    selectedCategoryText: {
        color: colors.buttons,
        fontSize: 18,
    },
    productItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.grey5,
        backgroundColor: colors.white,
        marginLeft: 15,
    },
    productContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productInfo: {
        flex: 1,
        marginRight: 15,
    },
    productName: {
        fontSize: 18,
        color: colors.grey1,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 13,
        color: colors.grey3,
    },
    priceContainer: {
        backgroundColor: colors.cardbackground,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.buttons,
    },
    productPrice: {
        fontSize: 14,
        color: colors.buttons,
        fontWeight: 'bold',
    },
});