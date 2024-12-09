import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../global/styles';  // Đảm bảo bạn import colors

// Import các màn hình từ các file riêng biệt
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import MyAccountScreen from '../screens/accountScreens/MyAccountScreen';
import ProductScreen from '../screens/ProductScreen'; 
import ProductDetails from '../screens/ProductDetails'; 
import DetailAccountScreen from '../screens/accountScreens/DetailAccountScreen';
import FavoriteProductsScreen from '../screens/accountScreens/FavoriteProductsScreen';
import PurchaseHistoryScreen from '../screens/accountScreens/PurchaseHistoryScreen';
import SettingScreen from '../screens/accountScreens/SettingScreen';
import SupportScreen from '../screens/accountScreens/SupportScreen';
import ChangePasswordScreen from '../screens/accountScreens/ChangePasswordScreen';
import RestaurantScreen from '../screens/restaurantTabs/RestaurantScreen';
import ShoppingCartScreen from '../screens/ShoppingCartScreen';
import TableDetail from '../screens/restaurantTabs/TableDetails';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import PaymentOptionsScreen from '../screens/PaymentOptionsScreen';
import RestaurantsMapScreen from '../screens/RestaurantsMapScreen';
import Map from '../screens/accountScreens/Map';

const ClientTab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} />
      <Stack.Screen name="DetailAccountScreen" component={DetailAccountScreen} />
      <Stack.Screen name="FavoriteProductsScreen" component={FavoriteProductsScreen} />
      <Stack.Screen name="PurchaseHistoryScreen" component={PurchaseHistoryScreen} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="SupportScreen" component={SupportScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="Map" component={Map} />
      <Stack.Screen name="AppointmentDetailScreen" component={AppointmentDetailScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductScreen" component={ProductScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="RestaurantScreen" component={RestaurantScreen} />
      <Stack.Screen name="ShoppingCart" component={ShoppingCartScreen} />
      <Stack.Screen name="TableDetail" component={TableDetail} />
      <Stack.Screen name="PaymentOptions" component={PaymentOptionsScreen} />
      <Stack.Screen name="RestaurantsMapScreen" component={RestaurantsMapScreen} />
      <Stack.Screen name="Map" component={Map} />
    </Stack.Navigator>
  );
}
function MyOrderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Orders" component={MyOrdersScreen} />
      <Stack.Screen name="AppointmentDetailScreen" component={AppointmentDetailScreen} />
    </Stack.Navigator>
  );
}

export default function RootClientTabs() {
  return (
    <ClientTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,  // Đặt màu nền của tab bar
          borderTopWidth: 1,  
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeStack') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'MyOrderStack') {
            iconName = 'list';
          } else if (route.name === 'AccountStack') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.buttons,  // Màu khi tab được chọn
        tabBarInactiveTintColor: colors.grey2,  // Màu khi tab không được chọn
      })}
    >
      <ClientTab.Screen 
        name="HomeStack" 
        component={HomeStack} 
        options={{ 
          tabBarLabel: 'Home',
          headerShown: false // Hoặc thêm ở đây nếu bạn chỉ muốn ẩn cho tab Home
        }} 
      />
      <ClientTab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ 
          tabBarLabel: 'Search',
          headerShown: false 
        }} 
      />
      <ClientTab.Screen 
        name="MyOrderStack" 
        component={MyOrderStack} 
        options={{ 
          tabBarLabel: 'My Orders',
          headerShown: false 
        }} 
      />
      <ClientTab.Screen 
        name="AccountStack" 
        component={AccountStack} 
        options={{ 
          tabBarLabel: 'My Account',
          headerShown: false 
        }} 
      />
      
    </ClientTab.Navigator>
  );
}