import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Table({ restaurantId }) {
    const [tables, setTables] = useState([]);
    const navigation = useNavigation(); // Sử dụng useNavigation

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const tablesCollection = await firestore()
                    .collection('restaurants')
                    .doc(restaurantId)
                    .collection('table')
                    .get();
                const tablesList = tablesCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTables(tablesList);
            } catch (error) {
                console.error('Error fetching tables:', error);
            }
        };

        fetchTables();
    }, [restaurantId]);

    const renderTableItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.tableItem}
            onPress={() => navigation.navigate('TableDetail', { 
                table: {
                    ...item,
                    restaurantId: restaurantId // Đảm bảo restaurantId được truyền
                }
            })}
        >
            <Image source={{ uri: item.image }} style={styles.tableImage} />
            <View style={styles.tableOverlay}>
                <Text style={styles.tableName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={tables}
            renderItem={renderTableItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.tablesContainer}
        />
    );
}

const styles = StyleSheet.create({
    tablesContainer: {
        paddingHorizontal: 10,
    },
    tableItem: {
        width: (SCREEN_WIDTH - 40) / 2,
        height: 150,
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
    },
    tableImage: {
        width: '100%',
        height: '100%',
    },
    tableOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});