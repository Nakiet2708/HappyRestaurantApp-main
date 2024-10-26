import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global/styles';
import firestore from '@react-native-firebase/firestore';

const ReviewComponent = ({ restaurantName }) => {
  const [reviews, setReviews] = useState([]);

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

        console.log('Fetched Reviews:', allReviews); // Log dữ liệu reviews
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
        <Image source={{ uri: item.userImage }} style={styles.avatar} />
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

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={(item, index) => index.toString()}
    />
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
});

export default ReviewComponent;
