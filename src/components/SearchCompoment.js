import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, Modal, TextInput, FlatList, TouchableOpacity, Keyboard, Image, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global/styles';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import firestore from '@react-native-firebase/firestore';

const SCREEN_WIDTH = Dimensions.get('window').width;

const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function SearchComponent() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [textInputFossued, setTextInputFossued] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [searchText, setSearchText] = useState('');
    const textInput = useRef(0);

    const handleSearch = async (text) => {
        setSearchText(text);
        if (text) {
            const searchTerm = text.toLowerCase().trim();
            console.log('Search term:', searchTerm);

            const productsCollection = await firestore().collectionGroup('product').get();
            const filteredProducts = productsCollection.docs
                .map(doc => {
                    const data = doc.data();
                    console.log('Product name:', data.name);
                    return { 
                        id: doc.id, 
                        ...data, 
                        categoryId: doc.ref.parent.parent.id,
                        type: 'product'
                    };
                })
                .filter(product => {
                    const productName = product.name.toLowerCase();
                    const includesSearchTerm = productName.indexOf(searchTerm) !== -1;
                    console.log(`${productName} includes ${searchTerm}:`, includesSearchTerm);
                    return includesSearchTerm;
                });

            const restaurantsCollection = await firestore().collection('restaurants').get();
            const filteredRestaurants = restaurantsCollection.docs
                .map(doc => {
                    const data = doc.data();
                    console.log('Restaurant name:', data.restaurantName);
                    return { 
                        id: doc.id, 
                        ...data,
                        type: 'restaurant'
                    };
                })
                .filter(restaurant => {
                    const restaurantName = restaurant.restaurantName.toLowerCase();
                    const includesSearchTerm = restaurantName.indexOf(searchTerm) !== -1;
                    console.log(`${restaurantName} includes ${searchTerm}:`, includesSearchTerm);
                    return includesSearchTerm;
                });

            const results = [...filteredProducts, ...filteredRestaurants];
            console.log('Final results:', results);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const renderItem = ({ item }) => {
        if (item.type === 'product') {
            return (
                <TouchableOpacity 
                    style={styles.productItem}
                    onPress={() => {
                        Keyboard.dismiss();
                        navigation.navigate('ProductDetails', { product: item });
                        setModalVisible(false);
                        setTextInputFossued(true);
                    }}
                >
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productPrice}>Giá tiền: {formatPrice(item.price)} VNĐ</Text>
                    </View>
                    <Image 
                        source={{ uri: item.image }} 
                        style={styles.productImage}
                    />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity 
                    style={styles.restaurantItem}
                    onPress={() => {
                        Keyboard.dismiss();
                        navigation.navigate('RestaurantScreen', { restaurantId: item.id });
                        setModalVisible(false);
                        setTextInputFossued(true);
                    }}
                >
                    <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                    <Image 
                        source={{ uri: item.images }} 
                        style={styles.restaurantImage}
                    />
                </TouchableOpacity>
            );
        }
    };

    return (
        <View style={{ alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
                <View style={[styles.SearchArea]}>
                    <Icon
                        name="search"
                        style={styles.searchIcon}
                        type="material"
                        iconStyle={{ marginLeft: 5 }}
                        size={32}
                    />
                    <Text style={{ fontSize: 15 }}>Tìm kiếm món ăn hoặc nhà hàng ?</Text>
                </View>
            </TouchableWithoutFeedback>
            <Modal animationType="fade" transparent={false} visible={modalVisible}>
                <View style={styles.modal}>
                    <View style={styles.view1}>
                        <View style={styles.TextInput}>
                            <Animatable.View
                                style={styles.iconContainer}
                                animation={textInputFossued ? "fadeInRight" : "fadeInLeft"}
                                duration={400}
                            >
                                <Icon
                                    name={textInputFossued ? "arrow-back" : "search"}
                                    onPress={() => {
                                        if (textInputFossued) setModalVisible(false);
                                        setTextInputFossued(true);
                                    }}
                                    style={styles.icon2}
                                    type="material"
                                    iconStyle={{ marginRight: 5 }}
                                />
                            </Animatable.View>
                            <TextInput
                                placeholder=""
                                style={styles.input}
                                autoFocus={false}
                                ref={textInput}
                                onFocus={() => setTextInputFossued(true)}
                                onBlur={() => setTextInputFossued(false)}
                                onChangeText={handleSearch}
                            />
                            <Animatable.View style={styles.iconContainer}>
                                <Icon
                                    name={textInputFossued ? "close" : null}
                                    iconStyle={{ color: colors.grey3 }}
                                    type="material"
                                    style={styles.closeIcon}
                                    onPress={() => {
                                        textInput.current.clear();
                                        setSearchResults([]);
                                    }}
                                />
                            </Animatable.View>
                        </View>
                    </View>
                    {searchText ? (
                        <Text style={styles.searchTitle}>Tìm kiếm '{searchText}' là:</Text>
                    ) : null}
                    <FlatList
                        data={searchResults}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.resultsContainer}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    text1: {
        color: colors.grey3,
        fontSize: 16
    },
    TextInput: {
        borderWidth: 1,
        borderRadius: 12,
        marginHorizontal: 0,
        borderColor: "#86939e",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
    },
    iconContainer: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    SearchArea: {
        marginTop: 10,
        width: "94%",
        height: 50,
        backgroundColor: colors.grey5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.grey4,
        flexDirection: "row",
        alignItems: "center"
    },
    searchIcon: {
        fontSize: 24,
        padding: 5,
        color: colors.grey2,
    },
    view1: {
        height: 70,
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    view2: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
    },
    icon2: {
        fontSize: 24,
        padding: 5,
        color: colors.grey2,
    },
    modal: {
        flex: 1,
    },
    closeIcon: {
        padding: 5,
    },
    searchTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 15,
        marginTop: 20,
        marginBottom: 10,
    },
    resultsContainer: {
        paddingHorizontal: 15,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    productInfo: {
        flex: 1,
        marginRight: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        color: 'red',
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
    },
    restaurantItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    restaurantInfo: {
        flex: 1,
        marginRight: 15,
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    restaurantImage: {
        width: 70,
        height: 70,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
    },
});