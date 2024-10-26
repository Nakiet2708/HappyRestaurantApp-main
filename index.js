import 'react-native-gesture-handler';
import React, { createContext, useContext, useMemo, useReducer } from "react";
import { View } from 'react-native';  // Thêm dòng này
import { Alert } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import '@react-native-firebase/app';

AppRegistry.registerComponent(appName, () => App);

