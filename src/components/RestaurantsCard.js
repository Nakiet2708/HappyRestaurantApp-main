import React from 'react';
import { Text, View, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../global/styles';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RestaurantsCard({
    restaurantName,
    businessAddress,
    averageRating,
    totalReviews,
    images,
    screenWidth
}) {
    return (
        <View style={{ ...styles.cardView, width: screenWidth }}>
            <Image
                style={{ ...styles.image, width: screenWidth }}
                source={{ uri: images }}
                onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
            <View style={styles.details}>
                <View>
                    <Text style={styles.restaurantName}>{restaurantName}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.address}>
                        <Text style={styles.text}>{businessAddress}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.review}>
                <Text style={styles.averageReview}>
                    {averageRating !== undefined && averageRating !== null
                        ? Number(averageRating).toFixed(1)
                        : 'N/A'}
                </Text>
                <Text style={styles.numberOfReview}>
                    {totalReviews ? `${totalReviews} reviews` : 'No reviews'}
                </Text>
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
    address: {
        marginTop: 5,
    },
    text: {
        color: colors.grey2,
        fontSize: 12,
    },
    review: {
        position: 'absolute',
        top: 0,
        right: 10,
        backgroundColor: 'rgba(52, 52, 52, 0.3)',
        padding: 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 12,
    },
    averageReview: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: -3,
    },
    numberOfReview: {
        color: 'white',
        fontSize: 13,
        marginRight: 0,
        marginLeft: 0,
    }
});
