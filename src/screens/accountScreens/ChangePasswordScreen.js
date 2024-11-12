import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../global/styles';
import auth from '@react-native-firebase/auth';

export default function ChangePasswordScreen({ navigation }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        try {
            setLoading(true);
            const user = auth().currentUser;
            const cred = auth.EmailAuthProvider.credential(user.email, currentPassword);
            
            // Xác thực lại người dùng
            await user.reauthenticateWithCredential(cred);
            
            // Đổi mật khẩu
            await user.updatePassword(newPassword);
            
            Alert.alert(
                'Thành công', 
                'Mật khẩu đã được cập nhật',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            let errorMessage = 'Đã có lỗi xảy ra';
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Mật khẩu hiện tại không đúng';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Mật khẩu mới quá yếu';
                    break;
                default:
                    errorMessage = error.message;
            }
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Đổi mật khẩu</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Nhập mật khẩu hiện tại"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showCurrentPassword}
                    />
                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                        <Icon 
                            name={showCurrentPassword ? "visibility" : "visibility-off"} 
                            size={24} 
                            color={colors.grey3} 
                            style={styles.eyeIcon}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                        <Icon 
                            name={showNewPassword ? "visibility" : "visibility-off"} 
                            size={24} 
                            color={colors.grey3} 
                            style={styles.eyeIcon}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Icon 
                            name={showConfirmPassword ? "visibility" : "visibility-off"} 
                            size={24} 
                            color={colors.grey3} 
                            style={styles.eyeIcon}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.changeButton, loading && styles.disabledButton]}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.changeButtonText}>Cập nhật mật khẩu</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.buttons,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerText: {
        marginLeft: 20,
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold'
    },
    content: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: colors.grey2,
        marginBottom: 8,
        marginTop: 16,
        fontWeight: '500'
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.grey4,
        borderRadius: 10,
        backgroundColor: 'white',
    },
    passwordInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 12,
        marginRight: 5
    },
    changeButton: {
        backgroundColor: colors.buttons,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    changeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7
    }
}); 