import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import SearchComponent from '../components/SearchCompoment';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../components/HomeHeader';
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SearchScreen() {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesCollection = await firestore().collection('menu').get();
                const categoriesList = categoriesCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoriesList);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => navigation.navigate('ProductScreen', { categoryId: item.id, categoryName: item.name })}
        >
            <Image source={{ uri: item.image }} style={styles.categoryImage} />
            <View style={styles.categoryOverlay}>
                <Text style={styles.categoryName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <HomeHeader />
            <SearchComponent />
            <Text style={styles.sectionTitle}>Các thể loại</Text>
            <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.categoriesContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
        marginTop: 20,
        marginBottom: 10,
    },
    categoriesContainer: {
        paddingHorizontal: 10,
    },
    categoryItem: {
        width: (SCREEN_WIDTH - 40) / 2,
        height: 150,
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});