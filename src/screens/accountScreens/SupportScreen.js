import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ToastAndroid } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../../global/styles';

export default function SupportScreen() {
    const handlePhoneCall = () => {
        Linking.openURL(`tel:0962175325`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:2024801030103@student.tdmu.edu.vn?subject=Yêu cầu hỗ trợ&body=Nội dung cần hỗ trợ:`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Trung tâm hỗ trợ</Text>
                <Text style={styles.description}>
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Vui lòng chọn phương thức liên hệ bên dưới:
                </Text>
                
                <TouchableOpacity style={styles.supportButton} onPress={handlePhoneCall}>
                    <Icon
                        name="phone"
                        type="material"
                        color={colors.white}
                        size={24}
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Gọi điện hỗ trợ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.supportButton, styles.emailButton]} onPress={handleEmail}>
                    <Icon
                        name="email"
                        type="material"
                        color={colors.white}
                        size={24}
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Gửi Email</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grey5,
        padding: 15,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: colors.grey2,
        marginBottom: 25,
        lineHeight: 22,
        textAlign: 'center',
    },
    supportButton: {
        backgroundColor: colors.buttons,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    emailButton: {
        backgroundColor: colors.grey1,
        marginTop: 15,
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});