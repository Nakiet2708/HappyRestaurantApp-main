// // import React from 'react';
// // import { createDrawerNavigator } from '@react-navigation/drawer';
// // import ClientTab from './ClientTabs';
// // import { Icon } from 'react-native-elements';
// // import { colors } from '../global/styles';

// // const Drawer = createDrawerNavigator();

// // export default function DrawerNavigator() {
// //   return (
// //     <Drawer.Navigator>
// //       <Drawer.Screen
// //         name="ClientTab"
// //         component={ClientTab}
// //         options={{
// //           title: 'Client',
// //           drawerIcon: ({ focused, size }) => (
// //             <Icon type='material-community' name='home' color={focused ? '#7cc' : colors.grey2} size={size} />
// //           ),
// //         }}
// //       />
// //     </Drawer.Navigator>
// //   );
// // }

// import React from 'react';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import HomeScreen from '../screens/HomeScreen';
// import ClientTabs from './ClientTabs';

// const Drawer = createDrawerNavigator();

// export default function DrawerNavigator() {
//   return (
//     <Drawer.Navigator initialRouteName="ClientTabs">
//       <Drawer.Screen name="Home" component={HomeScreen} />
//       <Drawer.Screen name="ClientTabs" component={ClientTabs} />
//     </Drawer.Navigator>
//   );
// }
// import React from 'react';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import RootClientTabs from './ClientTabs';
// import { Icon } from 'react-native-elements';
// import { colors } from '../global/styles';

// const Drawer = createDrawerNavigator();

// export default function DrawerNavigator() {
//   return (
//     <Drawer.Navigator>
//       <Drawer.Screen 
//         name="RootClientTabs"  // Ensure quotes are used here
//         component={RootClientTabs}  // Ensure this is a valid component
//         options={{
//           title: 'Client',
//           drawerIcon: ({ focused, size }) => (
//             <Icon 
//               type="material-community"
//               name="home"
//               color={focused ? colors.buttons : colors.grey2}
//               size={size}
//             />
//           )
//         }}
//       />
//     </Drawer.Navigator>
//   );
// }
