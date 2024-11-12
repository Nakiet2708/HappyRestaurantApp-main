import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global/styles';
import firestore from '@react-native-firebase/firestore';

const ReviewComponent = ({ restaurantName }) => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 2;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const usersSnapshot = await firestore().collection('USERS').get();
        const allReviews = [];

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          const userReviews = userData.Evaluate || [];
          userReviews.forEach((review) => {
            if (review.restaurantName === restaurantName) {
              allReviews.push({
                ...review,
                username: userData.username,
                userImage: userData.image,
              });
            }
          });
        });

        allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        setReviews(allReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [restaurantName]);

  const renderReview = ({ item }) => (
    <View style={styles.reviewContainer}>
      <View style={styles.header}>
        <Image 
          source={
            item.userImage 
              ? { uri: item.userImage }
              : require('../../assets/Image/avatar-vo-danh.png')
          }
          defaultSource={require('../../assets/Image/avatar-vo-danh.png')}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{item.username}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.ratingContainer}>
        {[...Array(item.rating)].map((_, index) => (
          <Icon key={index} name="star" type="material" color="green" size={20} />
        ))}
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
    </View>
  );

  const startIndex = currentPage * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  return (
    <View>
      <FlatList
        data={currentReviews}
        renderItem={renderReview}
        keyExtractor={(item, index) => index.toString()}
      />
      <View style={styles.pagination}>
        <TouchableOpacity 
          style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
          onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          <Icon name="chevron-left" type="material" size={24} 
            color={currentPage === 0 ? '#ccc' : '#000'} />
        </TouchableOpacity>

        <Text style={styles.pageNumber}>
          {currentPage + 1} / {totalPages}
        </Text>

        <TouchableOpacity 
          style={[styles.pageButton, endIndex >= reviews.length && styles.pageButtonDisabled]}
          onPress={() => setCurrentPage((prev) => (endIndex < reviews.length ? prev + 1 : prev))}
          disabled={endIndex >= reviews.length}
        >
          <Icon name="chevron-right" type="material" size={24} 
            color={endIndex >= reviews.length ? '#ccc' : '#000'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontWeight: 'bold',
  },
  date: {
    color: '#888',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  comment: {
    marginVertical: 5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pageButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 10,
  },
  pageButtonDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 15,
  },
});

export default ReviewComponent;
