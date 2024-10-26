import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Auth from './authStack';
import { CartProvider } from '../contexts/CartContext';

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <CartProvider>
                <Auth />
            </CartProvider>
        </NavigationContainer>
    );
}