import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Image } from 'react-native';
import { colors } from "../../global/styles";
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            const response = await auth().signInWithEmailAndPassword(email, password);
            console.log('User signed in:', response.user.email);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            
            handleReload();
        } catch (e) {
            Alert.alert('Email hoặc mật khẩu không chính xác');
        }
    };
    const handleReload = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'RootClientTabs' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('SignInWelcomeScreen')}>
                    <Icon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>MY ACCOUNT</Text>
            </View>

            <View style={styles.content}>
                <Image 
                    source={require('../../../assets/Image/logo.png')}
                    style={styles.logo}
                />

                <Text style={styles.inputLabel}>Tài khoản:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <Text style={styles.inputLabel}>Mật khẩu:</Text>
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

                <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                    <Text style={styles.signInText}>Đăng Nhập</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                    <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
                </TouchableOpacity>


                <View style={styles.createAccountContainer}>
                    <Text style={styles.newAccountText}>Nhà hàng Happy</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
                        <Text style={styles.createAccountText}>Tạo tài khoản</Text>
                    </TouchableOpacity>
                </View>
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
    signInButton: { 
        backgroundColor: colors.buttons, 
        padding: 15, 
        borderRadius: 5, 
        alignItems: 'center', 
        marginBottom: 15 
    },
    signInText: { 
        color: 'white', 
        fontWeight: 'bold' 
    },
    forgotPassword: { 
        color: colors.grey3, 
        fontSize: 16,
        textAlign: 'center', 
        marginBottom: 5, 
    },
    createAccountContainer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 5, 
    },
    newAccountText: { 
        color: colors.grey3,
        fontSize: 16,
    },
    createAccountText: { 
        color: colors.buttons, 
        marginLeft: 5,
        fontSize: 16,
    },
    logo: {
        width: 220,
        height: 220,
        marginBottom: 20,
        alignSelf: 'center',
    },
    inputLabel: {
        fontSize: 16,
        color: colors.grey3,
        marginBottom: 5,
        marginLeft: 2,
    },
});