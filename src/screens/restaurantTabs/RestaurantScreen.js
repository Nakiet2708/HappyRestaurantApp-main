import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../../global/styles';
import { Icon } from 'react-native-elements';
import Menu from '../../components/Menu';
import { useNavigation } from '@react-navigation/native'; 
import Table from '../../components/Table'; // Import Table component
import ReviewComponent from '../../components/ReviewComponent'; // Import component
import RatingComponent from '../../components/RatingComponent'; // Import component
import RatingSummary from '../../components/RatingSummary';
const TABS = ['MENU', 'Thông tin', 'Đặt bàn', 'Đánh giá'];

export default function RestaurantScreen({ route }) {
    const { restaurantId } = route.params;
    const [restaurantData, setRestaurantData] = useState(null);
    const [activeTab, setActiveTab] = useState('MENU');
    const navigation = useNavigation(); 

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const restaurantDoc = await firestore().collection('restaurants').doc(restaurantId).get();
                if (restaurantDoc.exists) {
                    setRestaurantData(restaurantDoc.data());
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching restaurant:', error);
            }
        };

        fetchRestaurant();
    }, [restaurantId]);

    if (!restaurantData) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'MENU':
                return (
                    <View style={{ flex: 1 }}>
                        <Menu restaurantId={restaurantId} />
                    </View>
                );
            case 'Thông tin':
                return (
                    <View style={{ flex: 1 }}>
                        <RatingSummary
                            restaurantName={restaurantData.restaurantName}
                            onUpdate={() => setActiveTab('Cập nhật đánh giá')}
                        />
                        {activeTab === 'Cập nhật đánh giá' && (
                            <RatingComponent restaurantName={restaurantData.restaurantName} />
                        )}
                        
                    </View>
                );
            case 'Đặt bàn':
                return (
                    <View style={{ flex: 1 }}>
                            <Table restaurantId={restaurantId} />
                    </View>
                );
            case 'Đánh giá':
                return (
                    <View style={{ flex: 1 }}>
                        <RatingComponent restaurantName={restaurantData.restaurantName} />
                        <ReviewComponent restaurantName={restaurantData.restaurantName} /> 
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon
                    name="arrow-back"
                    type="material"
                    size={30}
                    color={colors.black}
                />
            </TouchableOpacity>
            <FlatList
                ListHeaderComponent={
                    <>
                        <Image source={{ uri: restaurantData.images }} style={styles.image} />
                        <Text style={styles.name}>{restaurantData.restaurantName}</Text>
                        <View style={{ flexDirection: "row", paddingLeft: 10 }}>
                            <Icon type="material-community" name="map-marker" color={colors.grey1} size={18} />
                            <Text style={styles.address}>{restaurantData.businessAddress}</Text>
                        </View>
                        
                        <View style={styles.tabContainer}>
                            {TABS.map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                }
                ListFooterComponent={
                    <View style={styles.contentContainer}>
                        {renderTabContent()}
                    </View>
                }
                data={[]} 
                renderItem={null}
                keyExtractor={() => "key"}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.white
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 15,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 10,
        color: colors.black,
    },
    address: {
        fontSize: 18,
        color: colors.grey1,
        marginTop: -3.5
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 2,
        borderBottomColor: colors.grey5,
        backgroundColor: colors.buttons,
        marginTop: 10,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.white,
    },
    tabText: {
        fontSize: 15,
        color: colors.white,
        fontWeight: 'bold',
    },
    activeTabText: {
        fontSize: 17,
        color: colors.white,
    },
    contentContainer: {
        padding: 2,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 10,
        zIndex: 1,
        backgroundColor: colors.white,
        borderRadius: 90
        
    },
});
