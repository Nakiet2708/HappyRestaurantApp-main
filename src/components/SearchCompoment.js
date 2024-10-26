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
            const productsCollection = await firestore().collectionGroup('product').get();
            const filteredProducts = productsCollection.docs
                .map(doc => ({ id: doc.id, ...doc.data(), categoryId: doc.ref.parent.parent.id })) // Include categoryId
                .filter(product => product.name.toLowerCase().includes(text.toLowerCase()));
            setSearchResults(filteredProducts);
        } else {
            setSearchResults([]);
        }
    };

    const renderProductItem = ({ item }) => (
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
            <Image source={{ uri: item.image }} style={styles.productImage} />
        </TouchableOpacity>
    );

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
                    <Text style={{ fontSize: 15 }}>What are you looking for ?</Text>
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
                        <Text style={styles.searchTitle}>Các món có chữ '{searchText}' là:</Text>
                    ) : null}
                    <FlatList
                        data={searchResults}
                        renderItem={renderProductItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.productsContainer}
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
    productsContainer: {
        paddingHorizontal: 15,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 15,
    },
    productInfo: {
        flex: 1,
        marginRight: 15,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
    },
    productImage: {
        width: 80,
        height: 60,
        borderRadius: 5,
    },
});