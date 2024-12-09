import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import SearchComponent from '../components/SearchCompoment';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../components/HomeHeader';
import RestaurantsCard from '../components/RestaurantsCard';
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SearchScreen() {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [restaurantsData, setRestaurantsData] = useState([]);

    useEffect(() => {
        let categoriesSubscriber = null;
        let restaurantsSubscriber = null;
        let usersSubscriber = null;

        // Subscription cho categories
        categoriesSubscriber = firestore()
            .collection('menu')
            .onSnapshot(snapshot => {
                const categoriesList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                const sortedCategories = categoriesList.sort((a, b) => 
                    a.name.localeCompare(b.name, 'vi')
                );
                setCategories(sortedCategories);
            });

        // Subscription cho restaurants và ratings
        restaurantsSubscriber = firestore()
            .collection('restaurants')
            .onSnapshot(restaurantsSnapshot => {
                // Subscription cho users để lấy ratings
                usersSubscriber = firestore()
                    .collection('USERS')
                    .onSnapshot(usersSnapshot => {
                        const restaurantsList = restaurantsSnapshot.docs.map((doc) => {
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
                    });
            });

        // Cleanup function
        return () => {
            if (categoriesSubscriber) {
                categoriesSubscriber();
            }
            if (restaurantsSubscriber) {
                restaurantsSubscriber();
            }
            if (usersSubscriber) {
                usersSubscriber();
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <HomeHeader />
            <SearchComponent />
            <ScrollView>
                <Text style={styles.sectionTitle}>Các thể loại</Text>
                <View style={styles.categoriesContainer}>
                    {categories.map(item => (
                        <TouchableOpacity 
                            key={item.id}
                            style={styles.categoryItem}
                            onPress={() => navigation.navigate('ProductScreen', { 
                                categoryId: item.id, 
                                categoryName: item.name 
                            })}
                        >
                            <Image source={{ uri: item.image }} style={styles.categoryImage} />
                            <View style={styles.categoryOverlay}>
                                <Text style={styles.categoryName}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                
                <Text style={styles.sectionTitle}>Nhà hàng</Text>
                <View style={{ width: SCREEN_WIDTH, paddingTop: 10 }}>
                    {restaurantsData.map(item => (
                        <View key={item.id} style={{ paddingBottom: 20 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('RestaurantScreen', { 
                                        restaurantId: item.id 
                                    });
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
        marginTop: 20,
        marginBottom: 10,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        justifyContent: 'flex-start',
    },
    categoryItem: {
        width: (SCREEN_WIDTH - 60) / 3,
        height: 100,
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    categoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 5,
    },
    restaurantContainer: {
        width: SCREEN_WIDTH,
        paddingTop: 10,
    },
});