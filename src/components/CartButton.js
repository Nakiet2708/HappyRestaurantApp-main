import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import { colors } from '../global/styles'
import { useNavigation } from '@react-navigation/native'
import { useCart } from '../contexts/CartContext'


export default function CartButton() {
    const navigation = useNavigation()
    const { cartItems } = useCart()

    // Số lượng sản phẩm trong giỏ hàng
    const totalItems = cartItems.length

    return (
        <TouchableOpacity 
            style={styles.buttonContainer} 
            onPress={() => navigation.navigate('ShoppingCart')}
        >
            <View style={styles.button}>
                <Icon
                    type="material-community"
                    name="cart"
                    size={30}
                    color={colors.buttons}
                />
                {totalItems > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{totalItems}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        top: 10,
        right: 20,
        zIndex: 1000,
    },
    button: {
        backgroundColor: colors.white,
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    badge: {
        position: 'absolute',
        right: 5,
        top: 5,
        backgroundColor: colors.buttons,
        borderRadius: 8,
        width: 19,
        height: 19,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: 'bold'
    }
})