import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../global/styles';
import HomeHeader from '../components/HomeHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function MyOrdersScreen() {
	const [appointments, setAppointments] = useState([]);
	const navigation = useNavigation();

	const fetchAppointments = async () => {
		try {
			const userData = await AsyncStorage.getItem('user');
			if (userData) {
				const user = JSON.parse(userData);
				const snapshot = await firestore()
					.collection('Appointments')
					.where('email', '==', user.email) // Lọc theo email của người dùng hiện tại
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

	const renderAppointment = ({ item }) => (
		<View style={styles.appointmentItem}>
			<Text style={styles.detailStatus}>Trạng thái: {item.status}</Text>
			<Text style={styles.detailDateTime}>Thời gian: {item.dateTime.toDate().toLocaleDateString()}, {item.dateTime.toDate().toLocaleTimeString()}</Text>
			<Text style={styles.detailTotalPrice}>Tổng giá: {item.totalPrice}</Text>
			<TouchableOpacity
				style={styles.detailButton}
				onPress={() => navigation.navigate('AppointmentDetailScreen', { appointmentId: item.id })}
			>
				<Text style={styles.detailButtonText}>Xem Chi Tiết</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<HomeHeader />
			<FlatList
				data={appointments}
				renderItem={renderAppointment}
				keyExtractor={item => item.id}
				contentContainerStyle={styles.listContainer}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
	},
	listContainer: {
		padding: 16,
	},
	appointmentItem: {
		backgroundColor: colors.grey5,
		padding: 16,
		borderRadius: 8,
		marginBottom: 10,
	},

	detailStatus: {
		fontSize: 25,
		fontWeight: 'bold',
		color: colors.grey1,
		marginBottom: 2,
	},
	detailDateTime: {
		fontSize: 18,
		color: colors.grey2,
		marginBottom: 2,
	},
	detailTotalPrice: {
		fontSize: 20,
		color: colors.grey2,
		marginBottom: 2,
	},
	detailButton: {
		marginTop: 10,
		padding: 10,
		backgroundColor: colors.primary,
		borderRadius: 5,
	},
	detailButtonText: {
		color: colors.grey1,
		textAlign: 'center',
	},
});
