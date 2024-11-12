import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../global/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import HomeHeader from '../../components/HomeHeader';

const menuItems = [
    {
        title: 'Thông Tin Cá Nhân',
        icon: 'person',
        screen: 'DetailAccountScreen'
    },
    {
        title: 'Danh mục yêu thích',
        icon: 'favorite',
        screen: 'FavoriteProductsScreen'
    },
    {
        title: 'Lịch Sử Đặt Hàng',
        icon: 'history',
        screen: 'PurchaseHistoryScreen'
    },
    {
        title: 'Hỗ Trợ',
        icon: 'help',
        screen: 'SupportScreen'
    },
    {
        title: 'Đổi mật khẩu',
        icon: 'lock',
        screen: 'ChangePasswordScreen'
    }
];

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
        setLoading(true);
        try {
            const userDoc = await firestore().collection('USERS').doc(email).get();
            const defaultImage = require('../../../assets/Image/avatar-vo-danh.png');
            
            if (userDoc.exists) {
                const data = userDoc.data();
                if (data.image) {
                    // Nếu có ảnh từ server
                    setUserData({
                        image: { uri: data.image },
                        username: data.username || email.split('@')[0],
                    });
                } else {
                    // Nếu không có ảnh từ server, dùng ảnh mặc định
                    setUserData({
                        image: defaultImage,
                        username: data.username || email.split('@')[0],
                    });
                }
            } else {
                // Nếu không có document, dùng ảnh mặc định
                setUserData({
                    image: defaultImage,
                    username: email.split('@')[0],
                });
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
            // Trong trường hợp lỗi, vẫn set ảnh mặc định
            const defaultImage = require('../../../assets/Image/avatar-vo-danh.png');
            setUserData({
                image: defaultImage,
                username: email.split('@')[0],
            });
        } finally {
            setLoading(false);
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

    const MenuItem = ({ title, icon, onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>{title}</Text>
                <Icon name={icon} size={24} color={colors.grey2} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <HomeHeader />
            <ScrollView style={styles.scrollView}>
                <View style={styles.profileSection}>
                    <Image 
                        source={userData.image}
                        style={styles.profileImage}
                    />
                    <Text style={styles.username}>{userData.username}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <React.Fragment key={index}>
                            <MenuItem
                                title={item.title}
                                icon={item.icon}
                                onPress={() => navigation.navigate(item.screen)}
                            />
                            {index < menuItems.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </View>

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Đăng xuất</Text>
                    <Icon name="logout" size={24} color="white" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 20,
        marginTop: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.buttons,
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: colors.grey3,
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        marginHorizontal: 15,
        padding: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    menuItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: colors.grey1,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: colors.grey5,
        marginHorizontal: 20,
    },
    signOutButton: {
        flexDirection: 'row',
        backgroundColor: colors.buttons,
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 30,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    signOutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
});