import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView,
    ActivityIndicator,
    Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../global/styles';
import auth from '@react-native-firebase/auth';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (email.trim() === '') {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }

        // Kiểm tra tính hợp lệ của email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        try {
            setLoading(true);
            await auth().sendPasswordResetEmail(email);
            Alert.alert(
                'Thành công', 
                'Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
                [
                    { text: 'OK', onPress: () => navigation.navigate('SignInScreen') }
                ]
            );
        } catch (error) {
            let errorMessage = 'Đã có lỗi xảy ra';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email không hợp lệ';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Không tìm thấy tài khoản với email này';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
                    break;
                default:
                    errorMessage = error.message;
            }
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Quên mật khẩu</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Khôi phục mật khẩu</Text>
                <Text style={styles.subtitle}>
                    Vui lòng nhập email đã đăng ký. Chúng tôi sẽ gửi link khôi phục mật khẩu vào email của bạn.
                </Text>

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập địa chỉ email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                />

                <TouchableOpacity 
                    style={[styles.resetButton, loading && styles.disabledButton]}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.resetText}>Gửi link khôi phục</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.backToLogin}
                    onPress={() => navigation.navigate('SignInScreen')}
                    disabled={loading}
                >
                    <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.buttons,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerText: {
        marginLeft: 20,
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold'
    },
    content: {
        padding: 24,
        paddingTop: 30
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.buttons
    },
    subtitle: {
        color: colors.grey3,
        marginBottom: 30,
        fontSize: 15,
        lineHeight: 22
    },
    inputLabel: {
        fontSize: 16,
        color: colors.grey2,
        marginBottom: 8,
        fontWeight: '500'
    },
    input: {
        borderWidth: 1.5,
        borderColor: colors.grey4,
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#fafafa'
    },
    resetButton: {
        backgroundColor: colors.buttons,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    resetText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase'
    },
    backToLogin: {
        marginTop: 20,
        alignItems: 'center'
    },
    backToLoginText: {
        color: colors.buttons,
        fontSize: 16,
        fontWeight: '500',
        textDecorationLine: 'underline'
    },
    disabledButton: {
        opacity: 0.7
    }
});
