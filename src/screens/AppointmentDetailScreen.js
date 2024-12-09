import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../global/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const AppointmentDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { appointmentId } = route.params;
    const [appointment, setAppointment] = useState(null);
    const [restaurantData, setRestaurantData] = useState(null);

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            const doc = await firestore().collection('Appointments').doc(appointmentId).get();
            if (doc.exists) {
                setAppointment(doc.data());
            }
        };
        fetchAppointmentDetails();
    }, [appointmentId]);

    useEffect(() => {
        const fetchRestaurantData = async () => {
            if (appointment?.tableItems?.[0]?.restaurantName) {
                try {
                    const restaurantSnapshot = await firestore()
                        .collection('restaurants')
                        .where('restaurantName', '==', appointment.tableItems[0].restaurantName)
                        .get();

                    if (!restaurantSnapshot.empty) {
                        setRestaurantData(restaurantSnapshot.docs[0].data());
                    }
                } catch (error) {
                    console.error('Error fetching restaurant data:', error);
                }
            }
        };

        fetchRestaurantData();
    }, [appointment]);

    if (!appointment) {
        return <Text style={styles.loadingText}>Đang tải...</Text>;
    }

    const date = appointment.dateTime.toDate();
    const formattedDate = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const handleNavigation = () => {
        if (restaurantData) {
            navigation.navigate('RestaurantsMap', {
                destinationRestaurant: {
                    latitude: parseFloat(restaurantData.latitude),
                    longitude: parseFloat(restaurantData.longitude),
                    restaurantName: restaurantData.restaurantName,
                    businessAddress: restaurantData.businessAddress
                }
            });
        } else {
            Alert.alert('Thông báo', 'Không thể tìm thấy thông tin nhà hàng');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Order Info */}
                <View style={styles.section}>
                    <View style={styles.infoRow}>
                        <Icon name="schedule" size={20} color={colors.grey2} />
                        <Text style={styles.infoText}>
                            {formattedDate} - {formattedTime}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="person" size={20} color={colors.grey2} />
                        <Text style={styles.infoText}>{appointment.username}</Text>
                    </View>
                    {appointment.recipientName && (
                        <View style={styles.infoRow}>
                            <Icon name="person-outline" size={20} color={colors.grey2} />
                            <Text style={styles.infoText}>Người nhận: {appointment.recipientName}</Text>
                        </View>
                    )}
                    {appointment.recipientPhone && (
                        <View style={styles.infoRow}>
                            <Icon name="phone" size={20} color={colors.grey2} />
                            <Text style={styles.infoText}>SĐT người nhận: {appointment.recipientPhone}</Text>
                        </View>
                    )}
                    <View style={styles.statusContainer}>
                        <View style={styles.statusRow}>
                            <Icon name="local-shipping" size={20} color={colors.buttons} />
                            <Text style={styles.statusText}>{appointment.status}</Text>
                        </View>
                        {appointment?.tableItems?.length > 0 && restaurantData && (
                            <TouchableOpacity 
                                style={styles.navigationButton}
                                onPress={handleNavigation}
                            >
                                <Icon name="directions" size={20} color={colors.white} />
                                <Text style={styles.navigationButtonText}>Dẫn đường</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Food Items */}
                {appointment.otherItems && appointment.otherItems.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Các món ăn đã đặt:</Text>
                        {appointment.otherItems.map((item, index) => (
                            <View key={index} style={styles.orderItem}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    {item.options && item.options.length > 0 && (
                                        <Text style={styles.itemOptions}>
                                            ({item.options.join(', ')})
                                        </Text>
                                    )}
                                    <View style={styles.priceQuantityRow}>
                                        <Text style={styles.itemPrice}>
                                            {item.ProductTotalPrice.toLocaleString('vi-VN')} VNĐ
                                        </Text>
                                        <Text style={styles.quantity}>x{item.quantity}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Table Items */}
                {appointment.tableItems && appointment.tableItems.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Phòng đã đặt:</Text>
                        {appointment.tableItems.map((item, index) => (
                            <View key={index} style={styles.orderItem}>
                                <Image source={{ uri: item.image }} style={styles.tableImage} />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>
                                        {item.name} - {item.restaurantName}
                                    </Text>
                                    <Text style={styles.timeSlot}>
                                        <Icon name="access-time" size={16} color={colors.grey2} /> {item.timeSlot}
                                    </Text>
                                    <Text style={styles.date}>
                                        <Icon name="event" size={16} color={colors.grey2} /> {item.date}
                                    </Text>
                                    <Text style={styles.itemPrice}>
                                        {item.price.toLocaleString('vi-VN')} VNĐ
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Price Summary */}
                <View style={[styles.section, styles.summarySection]}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Giảm giá:</Text>
                        <Text style={styles.discountValue}>
                            {appointment.otherItems?.reduce((total, item) => 
                                total + ((item.discountAmount || 0) * (item.quantity || 1)), 0).toLocaleString('vi-VN')} VNĐ
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Tổng tiền:</Text>
                        <Text style={styles.totalValue}>
                            {appointment.totalPrice.toLocaleString('vi-VN')} VNĐ
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        backgroundColor: colors.buttons,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        elevation: 3,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: colors.white,
        margin: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 16,
        color: colors.grey2,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginLeft: 10,
        fontSize: 16,
        color: colors.buttons,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grey1,
        marginBottom: 15,
    },
    orderItem: {
        flexDirection: 'row',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    tableImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.grey1,
        marginBottom: 5,
    },
    itemOptions: {
        fontSize: 14,
        color: colors.grey3,
        marginBottom: 5,
    },
    priceQuantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 15,
        color: colors.buttons,
        fontWeight: '500',
    },
    quantity: {
        fontSize: 15,
        color: colors.grey2,
    },
    timeSlot: {
        fontSize: 14,
        color: colors.grey2,
        marginBottom: 3,
    },
    date: {
        fontSize: 14,
        color: colors.grey2,
        marginBottom: 5,
    },
    summarySection: {
        marginTop: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
    },
    summaryLabel: {
        fontSize: 16,
        color: colors.grey2,
    },
    discountValue: {
        fontSize: 16,
        color: colors.grey2,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.grey1,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.buttons,
    },
    navigationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.buttons,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    navigationButtonText: {
        color: colors.white,
        fontWeight: '500',
        fontSize: 14,
    },
});

export default AppointmentDetailScreen;
