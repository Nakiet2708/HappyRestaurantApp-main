import React, { useEffect, useState } from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import SignInWelcomeScreen from '../screens/authScreens/SignInWelcome';
import SignInScreen from '../screens/authScreens/SignInScreen';
import SignUpScreen from '../screens/authScreens/SignUpScreen';
import ForgotPasswordScreen from '../screens/authScreens/ForgotPasswordScreen'
import RootClientTabs from './ClientTabs';
import DrawerNavigator from './DrawerNavigator';
import RestaurantsMapScreen from '../screens/RestaurantsMapScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

const Auth = createStackNavigator();

export default function AuthNavigator() {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const user = await AsyncStorage.getItem('user');
            setInitialRoute(user ? 'RootClientTabs' : 'SignInWelcomeScreen');
        };

        checkUser();
    }, []);

    if (initialRoute === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Auth.Navigator initialRouteName={initialRoute}>
            <Auth.Screen
                name="SignInWelcomeScreen"
                component={SignInWelcomeScreen}
                options={{
                    headerShown: false,
                    ...TransitionPresets.RevealFromBottomAndroid
                }}
            />
            <Auth.Screen
                name="SignInScreen"
                component={SignInScreen}
                options={{
                    headerShown: false,
                    ...TransitionPresets.RevealFromBottomAndroid
                }}
            />
            <Auth.Screen
                name="SignUpScreen"
                component={SignUpScreen}
                options={{
                    headerShown: false,
                    ...TransitionPresets.RevealFromBottomAndroid
                }}
            />
            <Auth.Screen
                name="ForgotPasswordScreen"
                component={ForgotPasswordScreen}
                options={{
                    headerShown: false,
                    ...TransitionPresets.RevealFromBottomAndroid
                }}
            />
            <Auth.Screen
                name="RootClientTabs"
                component={RootClientTabs}
                options={{
                    headerShown: false,
                    ...TransitionPresets.RevealFromBottomAndroid
                }}
            />
            <Auth.Screen
                name="RestaurantsMap"
                component={RestaurantsMapScreen}
                options={{
                    headerShown: false,
                    ...TransitionPresets.RevealFromBottomAndroid
                }}
            />
        </Auth.Navigator>
    );
}