import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Import Firestore
import HomeHeader from '../../components/HomeHeader';

export default function MyAccountScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({ image: '', username: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setUser(user);
            } else {
                setLoading(false);
            }
        };

        getUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserData(user.email);
        }
    }, [user]);

    const fetchUserData = async (email) => {
        setLoading(true); // Đặt loading về true khi bắt đầu fetch dữ liệu
        try {
            const userDoc = await firestore().collection('USERS').doc(email).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                setUserData({
                    image: data.image || 'https://vivureviews.com/wp-content/uploads/2022/08/avatar-vo-danh-10.png',
                    username: data.username || email.split('@')[0],
                });
            } else {
                setUserData({
                    image: 'https://vivureviews.com/wp-content/uploads/2022/08/avatar-vo-danh-10.png',
                    username: email.split('@')[0],
                });
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
        } finally {
            setLoading(false); // Đặt loading về false khi fetch dữ liệu xong
        }
    };

    const handleSignOut = async () => {
        await auth().signOut();
        await AsyncStorage.removeItem('user');
        setUser(null);
        setUserData({ image: '', username: '' });
        setLoading(false);
        navigation.navigate('SignInWelcomeScreen');
    };


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <HomeHeader navigation={navigation} />
            <View style={styles.profileContainer}>
                <Image 
                    source={{ uri: userData.image || 'https://vivureviews.com/wp-content/uploads/2022/08/avatar-vo-danh-10.png' }} 
                    style={styles.profileImage} 
                />
                <Text style={styles.username}>{userData.username}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {user ? (
                    <>
                        <View style={styles.infoContainer}>
                            <TouchableOpacity style={styles.infoItem} onPress={() => navigation.navigate('DetailAccountScreen')}>
                                <Text style={styles.infoText}>Thông Tin Cá Nhân</Text>
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity style={styles.infoItem} onPress={() => navigation.navigate('MyPromotionScreen')}>
                                <Text style={styles.infoText}>Ưu Đãi</Text>
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity style={styles.infoItem} onPress={() => navigation.navigate('PurchaseHistoryScreen')}>
                                <Text style={styles.infoText}>Lịch Sử Đặt Hàng</Text>
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity style={styles.infoItem} onPress={() => navigation.navigate('SupportScreen')}>
                                <Text style={styles.infoText}>Hỗ Trợ</Text>
                            </TouchableOpacity>
                            <View style={styles.separator} />
                            <TouchableOpacity style={styles.infoItem} onPress={() => navigation.navigate('SettingScreen')}>
                                <Text style={styles.infoText}>Cài Đặt</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                            <Text style={styles.buttonText}>Sign Out</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={styles.text}>Loading...</Text>
                )}
            </ScrollView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
    },
    profileContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 20,
    },
    infoItem: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '100%',
        marginVertical: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
        color: '#333',
    },
    button: {
        backgroundColor: '#ff4757',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});