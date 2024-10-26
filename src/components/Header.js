import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native'
import {colors, parameters} from "../global/styles"
import {Icon} from 'react-native-elements'

export default function Header({title, type}){
    return(
        <View style ={styles.header}>
            <View style ={styles.iconStyle}>
                <Icon 
                    type = "material-community"
                    name = {type}
                    color = {colors.headerText}
                    size = {38}
                    onPress ={()=>{}}
                />
            </View>
            <View>
                <Text style ={styles.headerText}>{title}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        backgroundColor: colors.buttons,
        height: parameters.headerHeight
    },
    headerText: {
        color: colors.headerText,
        fontSize: 25,
        fontWeight: "bold",
            marginLeft: 30,
            marginTop: 3
    }
})