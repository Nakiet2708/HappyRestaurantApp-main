import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

export const globalSignOut = async (navigation) => {
    try {
        // 1. Hủy tất cả các listeners Firestore
        firestore().terminate();
        
        // 2. Xóa tất cả dữ liệu local
        await AsyncStorage.clear();
        
        // 3. Đăng xuất Firebase
        await auth().signOut();
        
        // 4. Reset navigation stack
        navigation.reset({
            index: 0,
            routes: [{ name: 'SignInWelcomeScreen' }],
        });
        
        // 5. Khởi động lại kết nối Firestore
        await firestore().enableNetwork();
        
    } catch (error) {
        console.error("Error during sign out:", error);
    }
}; 