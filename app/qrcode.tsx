import React, { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeResponse {
    message: string;
    qrCodeUrl: string;
    expiresAt: string;
    expirationMinutes: number;
}

const QRCodeComponent: React.FC = () => {
    const [qrCodeData, setQrCodeData] = useState<QRCodeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [adminAddress, setAdminAddress] = useState<string>(process.env.EXPO_ADMIN_ADDRESS || '0x9a77A46f27ee0663fe44BC3b51dBba37092Cf9c0');
    const [sessionAadhar, setSessionAadhar] = useState<string>(''); // Add session Aadhar state

    const generateQRCode = async () => {
        if (!sessionAadhar) {
            Alert.alert('Error', 'Session Aadhar number is required');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://notional-yeti-461501-r9.uc.r.appspot.com/api/voters/generate-voting-qr/${sessionAadhar}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-address': adminAddress,
                },
                body: JSON.stringify({
                    expirationMinutes: 30
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: QRCodeResponse = await response.json();
            setQrCodeData(data);
        } catch (error) {
            console.error('Error generating QR code:', error);
            Alert.alert('Error', 'Failed to generate QR code');
        } finally {
            setLoading(false);
        }
    };

    // Function to get session Aadhar from your app's storage/context
    const getSessionAadhar = async () => {
        // Replace this with your actual method to get session Aadhar
        // For example, from AsyncStorage, Context, or props
        try {
            // Example: const aadhar = await AsyncStorage.getItem('sessionAadhar');
            // Example: const aadhar = userContext.aadharNumber;
            const aadhar = '456789123654'; // Temporary - replace with actual session data
            setSessionAadhar(aadhar);
        } catch (error) {
            console.error('Error getting session Aadhar:', error);
            Alert.alert('Error', 'Failed to get session Aadhar number');
        }
    };

    const handleQRCodePress = async () => {
        if (qrCodeData?.qrCodeUrl) {
            try {
                // Check if the URL can be opened in the app
                const supported = await Linking.canOpenURL(qrCodeData.qrCodeUrl);
                if (supported) {
                    // Open in the app without redirecting to browser
                    await Linking.openURL(qrCodeData.qrCodeUrl);
                } else {
                    Alert.alert('Error', 'Cannot open this URL');
                }
            } catch (error) {
                console.error('Error opening URL:', error);
                Alert.alert('Error', 'Failed to open URL');
            }
        }
    };

    useEffect(() => {
        getSessionAadhar();
    }, []);

    useEffect(() => {
        if (sessionAadhar) {
            generateQRCode();
        }
    }, [sessionAadhar]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Voting QR Code</Text>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Generating QR code...</Text>
                </View>
            ) : qrCodeData ? (
                <View style={styles.qrContainer}>
                    <TouchableOpacity onPress={handleQRCodePress}>
                        <View style={styles.qrCodeWrapper}>
                            <QRCode
                                value={qrCodeData.qrCodeUrl}
                                size={200}
                                backgroundColor="white"
                                color="#1e293b"
                            />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.message}>{qrCodeData.message}</Text>
                    <Text style={styles.expiration}>
                        Expires at:
                    </Text>
                    <Text style={styles.expirationTime}>
                        {new Date(qrCodeData.expiresAt).toLocaleString()}
                    </Text>
                    <Text style={styles.expiration}>
                        Valid for {qrCodeData.expirationMinutes} minutes
                    </Text>
                </View>
            ) : (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to generate QR code</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={generateQRCode}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 40,
        color: '#1e293b',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    qrContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        maxWidth: 320,
        width: '100%',
    },
    qrCodeWrapper: {
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        marginBottom: 20,
    },
    message: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: '600',
        color: '#059669',
        textAlign: 'center',
        marginBottom: 15,
    },
    expiration: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500',
    },
    expirationTime: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '600',
        marginTop: 5,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 15,
        fontWeight: '500',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 16,
        color: '#dc2626',
        textAlign: 'center',
        fontWeight: '500',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default QRCodeComponent;