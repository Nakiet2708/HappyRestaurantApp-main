import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { colors } from "../../global/styles";
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = () => {
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        // Kiểm tra tính hợp lệ của email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu và xác nhận mật khẩu không khớp');
            return;
        }

        auth()
            .createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Lưu dữ liệu người dùng lên Firestore
                firestore()
                    .collection('USERS')
                    .doc(user.email)
                    .set({
                        email: user.email,
                        createdAt: firestore.FieldValue.serverTimestamp(),
                    })
                    .then(() => {
                        console.log('Người dùng đã đăng ký và dữ liệu đã được lưu!');
                        navigation.navigate('SignInScreen');
                    })
                    .catch(error => {
                        Alert.alert('Error', 'Đăng ký thành công nhưng không thể lưu dữ liệu người dùng');
                        console.error(error);
                    });
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert('Error', 'That email address is already in use!');
                } else if (error.code === 'auth/invalid-email') {
                    Alert.alert('Error', 'That email address is invalid!');
                } else if (error.code === 'auth/weak-password') {
                    Alert.alert('Error', 'The password is too weak.');
                } else {
                    Alert.alert('Error', error.message);
                }
                console.error(error);
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('SignInWelcomeScreen')}>
                    <Icon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Tạo tài khoản</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Đăng ký</Text>
                <Text style={styles.subtitle}>Vui lòng nhập email và tạo mật khẩu</Text>

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập địa chỉ email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon name={showPassword ? "visibility" : "visibility-off"} size={24} color={colors.grey3} style={styles.eyeIcon} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                />

                <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                    <Text style={styles.signUpText}>Đăng ký</Text>
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
    passwordContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1.5, 
        borderColor: colors.grey4, 
        borderRadius: 10, 
        marginBottom: 20,
        backgroundColor: '#fafafa'
    },
    passwordInput: { 
        flex: 1, 
        padding: 12,
        fontSize: 16
    },
    eyeIcon: { 
        padding: 12,
        marginRight: 5
    },
    signUpButton: { 
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
    signUpText: { 
        color: 'white', 
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase'
    }
});