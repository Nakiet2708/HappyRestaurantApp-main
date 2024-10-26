import React from 'react';
import { Text, View, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../global/styles';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function FoodCard({
    name,
    images,
    screenWidth,
    discountPrice,
}) {
    return (
        <View style={{ ...styles.cardView, width: screenWidth }}>
            <Image
                style={styles.image}
                source={{ uri: images }}
                onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
            {discountPrice && (
                <View style={styles.promotionBadge}>
                    <Text style={styles.promotionText}>Giảm giá</Text>
                    <Text style={styles.discountText}>{discountPrice}%</Text>
                </View>
            )}
            <View style={styles.details}>
                <Text style={styles.restaurantName}>{name}</Text>
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardView: {
        marginHorizontal: 9,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        borderWidth: 1,
        borderColor: colors.grey4,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        overflow: 'hidden',
    },
    image: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        height: 150,
    },
    details: {
        padding: 10,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grey1,
    },
    text: {
        color: colors.grey2,
        fontSize: 12,
        marginTop: 5,
    },
    promotionBadge: {
        position: 'absolute',
        top: '40%', // Điều chỉnh vị trí theo ý muốn
        left: '100%',
        transform: [{ translateX: -SCREEN_WIDTH * 0.2 }], // Điều chỉnh để căn giữa
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 100, 
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    promotionText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14, 
    },
    discountText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 22, 
    },
});
