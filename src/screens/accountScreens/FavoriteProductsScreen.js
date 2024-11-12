import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../global/styles';
import HomeHeader from '../../components/HomeHeader';

export default function FavoriteProductsScreen({ navigation }) {
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavoriteProducts();
    }, []);

    const loadFavoriteProducts = async () => {
        try {
            // Lấy thông tin user từ AsyncStorage
            const userData = await AsyncStorage.getItem('user');
            const user = JSON.parse(userData);

            if (!user?.email) return;

            // Lấy danh sách yêu thích từ Firestore
            const userDoc = await firestore()
                .collection('USERS')
                .doc(user.email)
                .get();

            const favorites = userDoc.data()?.FavoriteProducts || [];

            // Lấy thông tin chi tiết của từng sản phẩm
            const productsData = await Promise.all(
                favorites.map(async (fav) => {
                    const productDoc = await firestore()
                        .collection('menu')
                        .doc(fav.categoryId)
                        .collection('product')
                        .doc(fav.productId)
                        .get();

                    if (productDoc.exists) {
                        return {
                            ...productDoc.data(),
                            id: productDoc.id,
                            categoryId: fav.categoryId,
                            addedAt: fav.addedAt
                        };
                    }
                    return null;
                })
            );

            // Lọc bỏ các sản phẩm null và sắp xếp theo thời gian thêm vào
            const validProducts = productsData
                .filter(product => product !== null)
                .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

            setFavoriteProducts(validProducts);
        } catch (error) {
            console.error('Error loading favorite products:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProduct = ({ item }) => (
        <TouchableOpacity 
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
        >
            <Image 
                source={{ uri: item.image }} 
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>Giá: {item.price.toLocaleString('vi-VN')} VNĐ</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <HomeHeader />
            <Text style={styles.title}>Sản phẩm yêu thích</Text>
            {loading ? (
                <Text style={styles.loadingText}>Đang tải...</Text>
            ) : favoriteProducts.length > 0 ? (
                <FlatList
                    data={favoriteProducts}
                    renderItem={renderProduct}
                    keyExtractor={item => `${item.categoryId}-${item.id}`}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 15,
        color: colors.buttons,
    },
    listContainer: {
        padding: 15,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        padding: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: colors.grey1,
    },
    productPrice: {
        fontSize: 16,
        color: colors.grey2,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
        color: colors.grey3,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
        color: colors.grey3,
    },
});