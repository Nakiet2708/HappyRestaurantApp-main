import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global/styles';
import firestore from '@react-native-firebase/firestore';

const RatingSummary = ({ restaurantName, onUpdate }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const usersSnapshot = await firestore().collection('USERS').get();
        let totalRating = 0;
        let reviewCount = 0;

        usersSnapshot.forEach((doc) => {
          const userReviews = doc.data().Evaluate || [];
          userReviews.forEach((review) => {
            if (review.restaurantName === restaurantName) {
              totalRating += review.rating;
              reviewCount += 1;
            }
          });
        });

        setAverageRating(reviewCount ? (totalRating / reviewCount).toFixed(1) : 0);
        setTotalReviews(reviewCount);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, [restaurantName]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xếp hạng và đánh giá</Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.averageRating}>{averageRating}</Text>
        <Icon name="star" type="material" color={colors.lightgreen} size={20} />
        <Text style={styles.totalReviews}>{totalReviews} đánh giá</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  averageRating: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.black,
  },
  totalReviews: {
    fontSize: 16,
    color: colors.grey3,
    marginLeft: 5,
  },

});

export default RatingSummary;
