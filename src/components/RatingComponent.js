import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput,Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global/styles'; // Import colors
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RatingComponent = ({ restaurantName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRating = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!restaurantName || rating === 0 || !comment) {
      Alert.alert("Thông báo", "Bạn phải nhập đầy đủ nội dung.");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userRef = firestore().collection('USERS').doc(user.email);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const userEvaluate = userDoc.data().Evaluate || [];
          const existingReviewIndex = userEvaluate.findIndex(
            (review) => review.restaurantName === restaurantName
          );

          if (existingReviewIndex !== -1) {
            // Cập nhật đánh giá hiện có
            userEvaluate[existingReviewIndex] = {
              restaurantName,
              date: new Date().toISOString(),
              rating,
              comment,
            };
          } else {
            // Thêm đánh giá mới
            userEvaluate.push({
              restaurantName,
              date: new Date().toISOString(),
              rating,
              comment,
            });
          }

          await userRef.update({ Evaluate: userEvaluate });
          Alert.alert("Thông báo", "Đánh giá đã được cập nhật!");
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xếp hạng nhà hàng này</Text>
      <Text style={styles.subtitle}>Cho chúng tôi biết suy nghĩ của bạn</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleRating(star)}>
            <Icon
              name="star"
              type="material"
              color={star <= rating ? colors.lightgreen : colors.grey3}
              size={30}
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Viết bài đánh giá"
          placeholderTextColor={colors.grey4}
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.sendButton}>
          <Icon name="send" type="material" color={colors.lightgreen} size={24} />
        </TouchableOpacity>
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
    color: colors.black, // Sử dụng màu từ styles
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey1, // Sử dụng màu từ styles
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.grey4,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: colors.grey6,
  },
  input: {
    flex: 1,
    height: 80,
    padding: 10,
    color: colors.black,
  },
  sendButton: {
    padding: 10,
  },
});

export default RatingComponent;
