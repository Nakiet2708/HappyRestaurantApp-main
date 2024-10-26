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
                        navigation.navigate('RootClientTabs');
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
                <Text style={styles.headerText}>CREATE ACCOUNT</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Sign-Up</Text>
                <Text style={styles.subtitle}>Please enter your email and create a password</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon name={showPassword ? "visibility" : "visibility-off"} size={24} color={colors.grey3} style={styles.eyeIcon} />
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                />

                <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                    <Text style={styles.signUpText}>SIGN UP</Text>
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
        backgroundColor: colors.buttons 
    },
    headerText: { 
        marginLeft: 20, 
        fontSize: 18, 
        color: 'white', 
        fontWeight: 'bold' 
    },
    content: { 
        padding: 20 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
    subtitle: { 
        color: colors.grey3, 
        marginBottom: 20 
    },
    input: { 
        borderWidth: 1, 
        borderColor: colors.grey4, 
        borderRadius: 5, 
        padding: 10, 
        marginBottom: 15 
    },
    passwordContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: colors.grey4, 
        borderRadius: 5, 
        marginBottom: 15 
    },
    passwordInput: { 
        flex: 1, 
        padding: 10 
    },
    eyeIcon: { 
        padding: 10 
    },
    signUpButton: { 
        backgroundColor: colors.buttons, 
        padding: 15, 
        borderRadius: 5, 
        alignItems: 'center', 
        marginBottom: 15 
    },
    signUpText: { 
        color: 'white', 
        fontWeight: 'bold' 
    }
});