import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../../global/styles';
import HomeHeader from '../../components/HomeHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PurchaseHistoryScreen() {
    const [appointments, setAppointments] = useState([]);
    const navigation = useNavigation();

    const fetchAppointments = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const snapshot = await firestore()
                    .collection('Appointments')
                    .where('email', '==', user.email)
                    .where('status', 'in', ['Đã nhận hàng', 'Đã nhận phòng'])
                    .get();
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // sắp xếp
                data.sort((a, b) => b.dateTime.toDate() - a.dateTime.toDate());
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [])
    );

    const getStatusColor = (status) => {
        switch(status) {
            case 'Đã nhận hàng':
                return '#4CAF50'; // Green
            case 'Đã nhận phòng':
                return '#8BC34A'; // Light Green
            default:
                return colors.grey1;
        }
    };

    const renderAppointment = ({ item }) => {
        const statusColor = getStatusColor(item.status);
        const date = item.dateTime.toDate();
        const formattedDate = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <TouchableOpacity 
                style={styles.appointmentItem}
                onPress={() => navigation.navigate('AppointmentDetailScreen', { appointmentId: item.id })}
            >
                <View style={styles.headerRow}>
                    <View style={styles.statusContainer}>
                        <Icon name="check-circle" size={20} color={statusColor} />
                        <Text style={[styles.status, { color: statusColor }]}>
                            {item.status}
                        </Text>
                    </View>
                    <Text style={styles.orderNumber}>#{item.id.slice(-6)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Icon name="event" size={20} color={colors.grey2} />
                        <Text style={styles.detailText}>
                            {formattedDate} - {formattedTime}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Icon name="payment" size={20} color={colors.grey2} />
                        <Text style={styles.detailText}>
                            {item.totalPrice.toLocaleString('vi-VN')} VNĐ
                        </Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.viewDetailButton}
                    onPress={() => navigation.navigate('AppointmentDetailScreen', { appointmentId: item.id })}
                >
                    <Text style={styles.viewDetailText}>Xem Chi Tiết</Text>
                    <Icon name="chevron-right" size={20} color={colors.buttons} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <HomeHeader />
            <Text style={styles.title}>Đơn hàng đã hoàn thành</Text>
            {appointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="history" size={50} color={colors.grey3} />
                    <Text style={styles.emptyText}>Chưa có đơn hàng nào hoàn thành</Text>
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    renderItem={renderAppointment}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
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
    appointmentItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    status: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    orderNumber: {
        fontSize: 14,
        color: colors.grey2,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    detailsContainer: {
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    detailText: {
        fontSize: 15,
        color: colors.grey2,
        marginLeft: 10,
    },
    viewDetailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 5,
    },
    viewDetailText: {
        color: colors.buttons,
        fontSize: 15,
        fontWeight: '500',
        marginRight: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.grey3,
    },
});