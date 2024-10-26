import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
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
                <Text style={styles.title}>Sign-In</Text>
                <Text style={styles.subtitle}>Please enter the email and password registered with your account</Text>

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

                <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                    <Text style={styles.signInText}>SIGN IN</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => console.log('Forgot Password pressed')}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>

                <Text style={styles.orText}>OR</Text>

                <TouchableOpacity style={[styles.socialButton, styles.facebookButton]} onPress={() => console.log('Facebook Sign In pressed')}>
                    <Text style={styles.socialButtonText}>Sign In With Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => console.log('Google Sign In pressed')}>
                    <Text style={styles.socialButtonText}>Sign In With Google</Text>
                </TouchableOpacity>

                <View style={styles.createAccountContainer}>
                    <Text style={styles.newAccountText}>Restaurant Happy</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
                        <Text style={styles.createAccountText}>Create an account</Text>
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
        textAlign: 'center', 
        marginBottom: 20 
    },
    orText: { 
        textAlign: 'center', 
        marginVertical: 20, 
        color: colors.grey3 
    },
    socialButton: { 
        padding: 15, 
        borderRadius: 5, 
        alignItems: 'center', 
        marginBottom: 15 
    },
    facebookButton: { 
        backgroundColor: '#3b5998' 
    },
    googleButton: { 
        backgroundColor: '#dd4b39' 
    },
    socialButtonText: { 
        color: 'white', 
        fontWeight: 'bold' 
    },
    createAccountContainer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 20 
    },
    newAccountText: { 
        color: colors.grey3 
    },
    createAccountText: { 
        color: colors.buttons, 
        marginLeft: 5 
    }
});