import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { colors } from './src/global/styles';
import RootNavigator from './src/navigation/RootNavigatior';

export default function App() {
    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"  // Thay đổi này để phù hợp với nền trắng
                backgroundColor={colors.white}  // Đặt màu nền của StatusBar thành trắng
            />
            <RootNavigator />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: colors.white  // Thêm này để đặt nền trắng cho toàn bộ ứng dụng
    }
});