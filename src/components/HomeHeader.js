import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Icon } from 'react-native-elements'
import { colors, parameters } from '../global/styles'
import { useNavigation } from '@react-navigation/native'
import { useCart } from '../contexts/CartContext'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'

export default function HomeHeader() {
    const navigation = useNavigation()
    const { cartItems } = useCart()
    const [userImage, setUserImage] = useState('')

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth().currentUser;
            if (currentUser) {
                const userEmail = currentUser.email;
                const userDoc = await firestore().collection('USERS').doc(userEmail).get();
                if (userDoc.exists) {
                    setUserImage(userDoc.data().image);
                }
            }
        }

        fetchUserData()
    }, [])

    // Số lượng sản phẩm trong giỏ hàng
    const totalItems = cartItems.length
    

    return (
        <View style={styles.header}>
            <View style={{ alignItems: "center", justifyContent: "center", marginLeft: 15 }}>
                <Image
                    source={userImage ? { uri: userImage } : require('../../assets/Image/avatar-vo-danh.png')}
                    style={styles.userImage}
                />
            </View>

            <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.cardbackground, fontSize: 25, fontWeight: 'bold' }}>HappyFood</Text>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ShoppingCart')}>
                <View>
                    <Icon
                        type="material-community"
                        name="cart"
                        size={35}
                        color={colors.cardbackground}
                    />
                    {totalItems > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalItems}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        backgroundColor: colors.buttons,
        height: parameters.headerHeight,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15
    },
    userImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    badge: {
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: 'red',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    }
})
