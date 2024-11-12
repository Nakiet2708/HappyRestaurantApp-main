import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, Pressable, Image, Alert } from 'react-native';
import { colors } from '../global/styles';
import { Icon } from 'react-native-elements';
import HomeHeader from '../components/HomeHeader';
import FoodCard from '../components/FoodCard';
import RestaurantsCard from '../components/RestaurantsCard';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen() {
    const [delivery, setDelivery] = useState(true);
    const [indexCheck, setIndexCheck] = useState(-1);
    const [restaurantsData, setRestaurantsData] = useState([]);
    const [productsData, setProductsData] = useState([]);
    const navigation = useNavigation();
    const [menuData, setMenuData] = useState([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const restaurantsCollection = await firestore().collection('restaurants').get();
                const usersSnapshot = await firestore().collection('USERS').get();

                const restaurantsList = restaurantsCollection.docs.map((doc) => {
                    const restaurantData = doc.data();
                    let totalRating = 0;
                    let reviewCount = 0;

                    usersSnapshot.forEach((userDoc) => {
                        const userReviews = userDoc.data().Evaluate || [];
                        userReviews.forEach((review) => {
                            if (review.restaurantName === restaurantData.restaurantName) {
                                totalRating += review.rating;
                                reviewCount += 1;
                            }
                        });
                    });

                    const averageRating = reviewCount ? (totalRating / reviewCount).toFixed(1) : 0;

                    return {
                        id: doc.id,
                        ...restaurantData,
                        averageRating,
                        totalReviews: reviewCount,
                    };
                });

                const sortedRestaurants = restaurantsList.sort((a, b) => 
                    a.restaurantName.localeCompare(b.restaurantName, 'vi')
                );
                setRestaurantsData(sortedRestaurants);

                const menuCollection = await firestore().collection('menu').get();
                const menuList = menuCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMenuData(menuList);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
                Alert.alert('Error', 'Failed to fetch restaurants data');
            }
        };

        const fetchProducts = async () => {
            try {
                const productsCollection = await firestore()
                    .collection('menu')
                    .get();

                let productsList = [];
                for (const menuDoc of productsCollection.docs) {
                    const productCollection = await firestore()
                        .collection('menu')
                        .doc(menuDoc.id)
                        .collection('product')
                        .where('status', '==', 'Khuyến mãi') // Lọc sản phẩm có status "Khuyến mãi"
                        .get();

                    const products = productCollection.docs.map(doc => ({
                        id: doc.id,
                        categoryId: menuDoc.id, // Lấy menuDoc.id làm categoryId
                        ...doc.data()
                    }));

                    productsList = [...productsList, ...products];
                }

                setProductsData(productsList);
            } catch (error) {
                console.error('Error fetching products:', error);
                Alert.alert('Error', 'Failed to fetch products data');
            }
        };
    
        fetchRestaurants();
        fetchProducts();
    }, []);

    return (
        <View style={styles.container}>
            <HomeHeader />
            
            <ScrollView>
                <View style={styles.filterView}>
                    <View style={styles.locationView}>
                        <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: 40 }}>
                            <Icon type="material-community" name="map-marker" color={colors.grey1} size={26} />
                            <Text style={{ marginLeft: 5 }}>Vị trí của bạn</Text>
                        </View>
                        <View>
                            <View style={styles.clockView}>
                                <Icon type="material-community" name="clock-time-four" color={colors.grey1} size={25} />
                                <Text style={{ marginLeft: 5 }}>Bây giờ</Text>
                            </View>
                        </View>
                    </View>
                    <View>
                        <Icon type="material-community" name="tune" color={colors.grey1} size={25} />
                    </View>
                </View>

                <View style={styles.headerTextView}>
                    <Text style={styles.headerText}>Thể loại</Text>
                </View>

                <View>
                    <FlatList
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        data={menuData}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <Pressable onPress={() => navigation.navigate('ProductScreen', { categoryId: item.id, categoryName: item.name })}>
                                <View style={styles.smallCard}>
                                    <Image 
                                        source={{ uri: item.image }}
                                        style={{ width: 60, height: 60, borderRadius: 30 }} 
                                    />
                                    <View>
                                        <Text style={styles.smallCardText}>{item.name}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        )}
                    />
                </View>
                
                <View style={styles.headerTextView}>
                    <Text style={styles.headerText}>Khuyến mãi</Text>
                </View>
                <View>
                    <FlatList
                        style={{ marginTop: 10, marginBottom: 10 }}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        data={productsData}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity                                
                                onPress={() => {
                                    navigation.navigate('ProductDetails', { 
                                        product: {
                                            id: item.id,
                                            name: item.name,
                                            image: item.image,
                                            price: item.price,
                                            discountPrice: item.discountPrice,
                                            categoryId: item.categoryId, // Đảm bảo categoryId được truyền
                                            describe: item.describe // Thêm mô tả nếu có
                                        }
                                    });
                                }}
                            >
                                <FoodCard
                                    screenWidth={SCREEN_WIDTH * 0.65}
                                    images={item.image}
                                    name={item.name}
                                    discountPrice={item.discountPrice}
                                />
                            </TouchableOpacity>
                        )}
                    />
                </View>
                
                <View style={styles.headerTextView}>
                    <Text style={styles.headerText}>Nhà hàng</Text>
                </View>
                
                <View style={{ width: SCREEN_WIDTH, paddingTop: 10 }}>
                    {restaurantsData.map(item => (
                        <View key={item.id} style={{ paddingBottom: 20 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('RestaurantScreen', { restaurantId: item.id });
                                }}
                            >
                                <RestaurantsCard
                                    screenWidth={SCREEN_WIDTH * 0.95}
                                    images={item.images}
                                    restaurantName={item.restaurantName}
                                    businessAddress={item.businessAddress}
                                    averageRating={item.averageRating}
                                    totalReviews={item.totalReviews}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

            </ScrollView>
            <View style={styles.floatButton}>
                <TouchableOpacity onPress={() => navigation.navigate('RestaurantsMapScreen')}>
                    <Icon type="material-community" name="map-marker" color={colors.buttons} size={25} />
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.buttons }}>Map</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    deliveryButton: {
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 15,
    },
    deliveryText: {
        marginLeft: 5,
        fontSize: 16,
    },
    filterView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        marginHorizontal: 10,
        marginVertical: 8
    },
    clockView: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 40,
        backgroundColor: colors.cardbackground,
        borderRadius: 15,
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginRight: 40
    },
    locationView: {
        flexDirection: "row",
        backgroundColor: colors.grey5,
        borderRadius: 15,
        paddingVertical: 3,
        justifyContent: "space-between"
    },
    headerText: {
        fontSize: 25,
        fontWeight: "bold",
        marginLeft: 10,
        color: colors.grey2
    },
    headerTextView: {
        backgroundColor: colors.grey5,
        paddingVertical: 2,
    },
    smallCard: {
        borderRadius: 30,
        backgroundColor: colors.grey5,
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        width: 80,
        margin: 10,
        height: 100
    },
    smallCardSelected: {
        borderRadius: 30,
        backgroundColor: colors.buttons,
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        width: 80,
        margin: 10,
        height: 100
    },
    smallCardTextSelected: {
        fontWeight: "bold",
        color: colors.cardbackground
    },
    smallCardText: {
        fontWeight: "bold",
        color: colors.grey2
    },
    floatButton: {
        position: 'absolute',
        bottom: 10,
        right: 15,
        backgroundColor: colors.white,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.buttons
    }
});
