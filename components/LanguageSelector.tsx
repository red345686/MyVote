import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SUPPORTED_LANGUAGES, useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

export const LanguageSelector: React.FC = () => {
    const { currentLanguage, setLanguage } = useLanguage();
    const [modalVisible, setModalVisible] = useState(false);

    const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);

    const handleLanguageSelect = (languageCode: string) => {
        setLanguage(languageCode);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={styles.languageButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.languageIcon}>🌐</Text>
                <Text style={styles.languageText}>{currentLang?.nativeName || 'English'}</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Language</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={SUPPORTED_LANGUAGES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        currentLanguage === item.code && styles.selectedLanguageOption
                                    ]}
                                    onPress={() => handleLanguageSelect(item.code)}
                                >
                                    <Text style={styles.languageName}>{item.name}</Text>
                                    <Text style={styles.languageNativeName}>{item.nativeName}</Text>
                                    {currentLanguage === item.code && (
                                        <Text style={styles.selectedIcon}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    languageIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    languageText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: width * 0.85,
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    selectedLanguageOption: {
        backgroundColor: '#eff6ff',
    },
    languageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        flex: 1,
    },
    languageNativeName: {
        fontSize: 14,
        color: '#6b7280',
        marginRight: 10,
    },
    selectedIcon: {
        fontSize: 18,
        color: '#2563eb',
        fontWeight: 'bold',
    },
});