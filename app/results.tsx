import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { G, Path, Svg } from 'react-native-svg';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';

// Import India map data
import indiaMapData from '../data/in.json';

const { width: screenWidth } = Dimensions.get('window');

interface StateData {
    name: string;
    totalSeats: number;
    parties: { [key: string]: number };
    cm: string;
    governor: string;
}

const stateData: { [key: string]: StateData } = {
    'andhra-pradesh': {
        name: 'Andhra Pradesh',
        totalSeats: 175,
        parties: { 'YSRCP': 11, 'TDP': 135, 'JSP': 21, 'BJP': 8 },
        cm: 'N. Chandrababu Naidu',
        governor: 'S. Abdul Nazeer'
    },
    'arunachal-pradesh': {
        name: 'Arunachal Pradesh',
        totalSeats: 60,
        parties: { 'BJP': 46, 'INC': 4, 'NPP': 5, 'Others': 5 },
        cm: 'Pema Khandu',
        governor: 'Kaiwalya Trivikram Parnaik'
    },
    'assam': {
        name: 'Assam',
        totalSeats: 126,
        parties: { 'BJP': 60, 'AGP': 9, 'UPPL': 6, 'INC': 29, 'AIUDF': 16, 'Others': 6 },
        cm: 'Himanta Biswa Sarma',
        governor: 'Lakshman Prasad Acharya'
    },
    'bihar': {
        name: 'Bihar',
        totalSeats: 243,
        parties: { 'JDU': 43, 'BJP': 74, 'RJD': 75, 'INC': 19, 'Others': 32 },
        cm: 'Nitish Kumar',
        governor: 'Rajendra Vishwanath Arlekar'
    },
    'chhattisgarh': {
        name: 'Chhattisgarh',
        totalSeats: 90,
        parties: { 'BJP': 54, 'INC': 35, 'Others': 1 },
        cm: 'Vishnu Deo Sai',
        governor: 'Ramen Deka'
    },
    'goa': {
        name: 'Goa',
        totalSeats: 40,
        parties: { 'BJP': 20, 'INC': 11, 'AAP': 2, 'Others': 7 },
        cm: 'Pramod Sawant',
        governor: 'P. S. Sreedharan Pillai'
    },
    'gujarat': {
        name: 'Gujarat',
        totalSeats: 182,
        parties: { 'BJP': 156, 'INC': 17, 'AAP': 5, 'Others': 4 },
        cm: 'Bhupendra Patel',
        governor: 'Acharya Devvrat'
    },
    'haryana': {
        name: 'Haryana',
        totalSeats: 90,
        parties: { 'BJP': 41, 'INC': 37, 'JJP': 10, 'Others': 2 },
        cm: 'Nayab Singh Saini',
        governor: 'Bandaru Dattatreya'
    },
    'himachal-pradesh': {
        name: 'Himachal Pradesh',
        totalSeats: 68,
        parties: { 'INC': 40, 'BJP': 25, 'Others': 3 },
        cm: 'Sukhvinder Singh Sukhu',
        governor: 'Shiv Pratap Shukla'
    },
    'jharkhand': {
        name: 'Jharkhand',
        totalSeats: 81,
        parties: { 'JMM': 30, 'INC': 16, 'RJD': 1, 'BJP': 26, 'Others': 8 },
        cm: 'Hemant Soren',
        governor: 'Santosh Kumar Gangwar'
    },
    'karnataka': {
        name: 'Karnataka',
        totalSeats: 224,
        parties: { 'INC': 135, 'BJP': 66, 'JDS': 19, 'Others': 4 },
        cm: 'Siddaramaiah',
        governor: 'Thawar Chand Gehlot'
    },
    'kerala': {
        name: 'Kerala',
        totalSeats: 140,
        parties: { 'LDF': 99, 'UDF': 41 },
        cm: 'Pinarayi Vijayan',
        governor: 'Arif Mohammed Khan'
    },
    'madhya-pradesh': {
        name: 'Madhya Pradesh',
        totalSeats: 230,
        parties: { 'BJP': 163, 'INC': 66, 'Others': 1 },
        cm: 'Mohan Yadav',
        governor: 'Mangubhai C. Patel'
    },
    'maharashtra': {
        name: 'Maharashtra',
        totalSeats: 288,
        parties: { 'BJP': 132, 'Shiv Sena': 40, 'NCP': 41, 'INC': 37, 'Others': 38 },
        cm: 'Devendra Fadnavis',
        governor: 'C. P. Radhakrishnan'
    },
    'manipur': {
        name: 'Manipur',
        totalSeats: 60,
        parties: { 'BJP': 32, 'NPP': 7, 'JDU': 6, 'INC': 5, 'Others': 10 },
        cm: 'N. Biren Singh',
        governor: 'Vinod Kumar Duggal'
    },
    'meghalaya': {
        name: 'Meghalaya',
        totalSeats: 60,
        parties: { 'NPP': 28, 'UDP': 11, 'BJP': 2, 'INC': 5, 'Others': 14 },
        cm: 'Conrad Sangma',
        governor: 'C. H. Vijayashankar'
    },
    'mizoram': {
        name: 'Mizoram',
        totalSeats: 40,
        parties: { 'ZPM': 27, 'MNF': 10, 'BJP': 2, 'INC': 1 },
        cm: 'Lalduhoma',
        governor: 'Hari Babu Kambhampati'
    },
    'nagaland': {
        name: 'Nagaland',
        totalSeats: 60,
        parties: { 'NDPP': 25, 'BJP': 12, 'NCP': 7, 'Others': 16 },
        cm: 'Neiphiu Rio',
        governor: 'La. Ganesan'
    },
    'odisha': {
        name: 'Odisha',
        totalSeats: 147,
        parties: { 'BJP': 78, 'BJD': 51, 'INC': 14, 'Others': 4 },
        cm: 'Mohan Charan Majhi',
        governor: 'Raghubar Das'
    },
    'punjab': {
        name: 'Punjab',
        totalSeats: 117,
        parties: { 'AAP': 92, 'INC': 18, 'SAD': 3, 'BJP': 2, 'Others': 2 },
        cm: 'Bhagwant Mann',
        governor: 'Gulab Chand Kataria'
    },
    'rajasthan': {
        name: 'Rajasthan',
        totalSeats: 200,
        parties: { 'BJP': 115, 'INC': 69, 'Others': 16 },
        cm: 'Bhajan Lal Sharma',
        governor: 'Haribhau Kisanrao Bagde'
    },
    'sikkim': {
        name: 'Sikkim',
        totalSeats: 32,
        parties: { 'SKM': 31, 'SDF': 1 },
        cm: 'Prem Singh Tamang',
        governor: 'Om Prakash Mathur'
    },
    'tamil-nadu': {
        name: 'Tamil Nadu',
        totalSeats: 234,
        parties: { 'DMK': 133, 'AIADMK': 66, 'BJP': 4, 'Others': 31 },
        cm: 'M. K. Stalin',
        governor: 'R. N. Ravi'
    },
    'telangana': {
        name: 'Telangana',
        totalSeats: 119,
        parties: { 'INC': 64, 'BRS': 39, 'BJP': 8, 'Others': 8 },
        cm: 'A. Revanth Reddy',
        governor: 'Jishnu Dev Varma'
    },
    'tripura': {
        name: 'Tripura',
        totalSeats: 60,
        parties: { 'BJP': 32, 'TMP': 13, 'CPIM': 10, 'Others': 5 },
        cm: 'Manik Saha',
        governor: 'Indrasena Reddy Nallu'
    },
    'uttar-pradesh': {
        name: 'Uttar Pradesh',
        totalSeats: 403,
        parties: { 'BJP': 255, 'SP': 111, 'RLD': 8, 'INC': 2, 'Others': 27 },
        cm: 'Yogi Adityanath',
        governor: 'Anandiben Patel'
    },
    'uttarakhand': {
        name: 'Uttarakhand',
        totalSeats: 70,
        parties: { 'BJP': 47, 'INC': 19, 'Others': 4 },
        cm: 'Pushkar Singh Dhami',
        governor: 'Gurmit Singh'
    },
    'west-bengal': {
        name: 'West Bengal',
        totalSeats: 294,
        parties: { 'AITC': 215, 'BJP': 77, 'INC': 0, 'Others': 2 },
        cm: 'Mamata Banerjee',
        governor: 'C. V. Ananda Bose'
    }
};

const partyColors: { [key: string]: string } = {
    'BJP': '#FF9933',
    'INC': '#19AAED',
    'AAP': '#0066CC',
    'TDP': '#FCDC00',
    'YSRCP': '#1569C7',
    'DMK': '#FF0000',
    'AIADMK': '#138808',
    'JMM': '#1B5E20',
    'RJD': '#00A651',
    'JDU': '#004B87',
    'SP': '#FF0000',
    'BSP': '#22409A',
    'CPI': '#B71C1C',
    'CPIM': '#CC0000',
    'AITC': '#20C997',
    'BJD': '#026A4E',
    'TRS': '#F84996',
    'BRS': '#F84996',
    'JDS': '#02865A',
    'SAD': '#0F4A8C',
    'NPP': '#FFA500',
    'Others': '#808080'
};

export default function Results() {
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [allStatesModalVisible, setAllStatesModalVisible] = useState(false);
    const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
    const [translatedStateData, setTranslatedStateData] = useState(stateData);

    const { t, currentLanguage } = useTranslation();

    // Translation effect
    useEffect(() => {
        const translateTexts = async () => {
            if (currentLanguage === 'en') {
                setTranslatedTexts({});
                setTranslatedStateData(stateData);
                return;
            }

            const textsToTranslate = {
                electionResults: 'Election Results',
                stateAssemblyResults: 'State Assembly Election Results 2024',
                backToDashboard: 'Back to Dashboard',
                tapStateForDetails: 'Tap on any state to view detailed results',
                stateName: 'State',
                totalSeats: 'Total Seats',
                chiefMinister: 'Chief Minister',
                governor: 'Governor',
                seatDistribution: 'Seat Distribution',
                seats: 'Seats',
                majorParties: 'Major Parties',
                others: 'Others',
                close: 'Close',
                noDataAvailable: 'No data available for this state',
                allStates: 'All States & UTs',
                leadingParty: 'Leading',
                cm: 'CM'
            };

            const translated: Record<string, string> = {};
            for (const [key, text] of Object.entries(textsToTranslate)) {
                translated[key] = await t(key, text);
            }
            setTranslatedTexts(translated);

            // Translate state data
            const translatedStates: { [key: string]: StateData } = {};
            for (const [stateKey, state] of Object.entries(stateData)) {
                translatedStates[stateKey] = {
                    ...state,
                    name: await t(`state_${stateKey}`, state.name),
                    cm: await t(`cm_${stateKey}`, state.cm),
                    governor: await t(`governor_${stateKey}`, state.governor)
                };
            }
            setTranslatedStateData(translatedStates);
        };

        translateTexts();
    }, [currentLanguage]);

    const getStateColor = (stateName: string): string => {
        const stateKey = stateName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        const state = stateData[stateKey];

        if (!state) return '#E5E7EB';

        // Find the party with the most seats
        let maxSeats = 0;
        let majorityParty = '';

        Object.entries(state.parties).forEach(([party, seats]) => {
            if (seats > maxSeats) {
                maxSeats = seats;
                majorityParty = party;
            }
        });

        return partyColors[majorityParty] || '#E5E7EB';
    };

    const handleStatePress = (stateName: string) => {
        const stateKey = stateName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        if (stateData[stateKey]) {
            setSelectedState(stateKey);
            setModalVisible(true);
        }
    };

    const renderAllStatesModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={allStatesModalVisible}
                onRequestClose={() => setAllStatesModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.allStatesModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {translatedTexts.allStates || 'All States & UTs'}
                            </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setAllStatesModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.allStatesGrid}>
                                {Object.entries(translatedStateData).map(([stateKey, state]) => {
                                    const majorityParty = Object.entries(state.parties)
                                        .sort(([, a], [, b]) => b - a)[0];

                                    return (
                                        <TouchableOpacity
                                            key={stateKey}
                                            style={[
                                                styles.stateCard,
                                                { borderLeftColor: getStateColor(state.name) }
                                            ]}
                                            onPress={() => {
                                                setAllStatesModalVisible(false);
                                                handleStatePress(state.name);
                                            }}
                                        >
                                            <View style={styles.stateCardHeader}>
                                                <Text style={styles.stateCardName}>{state.name}</Text>
                                                <View
                                                    style={[
                                                        styles.stateCardDot,
                                                        { backgroundColor: getStateColor(state.name) }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.stateCardSeats}>
                                                {state.totalSeats} {translatedTexts.seats || 'seats'}
                                            </Text>
                                            <Text style={styles.stateCardParty}>
                                                {translatedTexts.leadingParty || 'Leading:'} {majorityParty[0]} ({majorityParty[1]})
                                            </Text>
                                            <Text style={styles.stateCardCM}>
                                                {translatedTexts.cm || 'CM:'} {state.cm}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderInteractiveMap = () => {
        const mapWidth = Math.min(screenWidth - 32, 400); // Cap max width
        const mapHeight = mapWidth * 0.8; // Better aspect ratio

        // More accurate bounds for India
        const bounds = {
            minX: 68.0,
            maxX: 97.5,
            minY: 6.5,
            maxY: 37.0
        };

        const mapPadding = 20; // Reduced padding for better fit
        const viewBoxWidth = 800;
        const viewBoxHeight = 600;

        return (
            <View style={styles.mapContainer}>
                <Text style={styles.mapTitle}>
                    {translatedTexts.tapStateForDetails || 'Tap on any state to view detailed results'}
                </Text>

                <View style={styles.svgContainer}>
                    <Svg
                        width={mapWidth}
                        height={mapHeight}
                        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                        style={styles.mapSvg}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <G>
                            {indiaMapData.features && indiaMapData.features.map((feature, index) => {
                                const stateName = feature.properties?.name;
                                if (!stateName) return null;

                                const stateColor = getStateColor(stateName);
                                const coordinates = feature.geometry?.coordinates;

                                if (!coordinates) return null;

                                let pathData = '';

                                const scaleX = (x: number): number => {
                                    const normalized = (x - bounds.minX) / (bounds.maxX - bounds.minX);
                                    return normalized * (viewBoxWidth - 2 * mapPadding) + mapPadding;
                                };

                                const scaleY = (y: number): number => {
                                    const normalized = (bounds.maxY - y) / (bounds.maxY - bounds.minY);
                                    return normalized * (viewBoxHeight - 2 * mapPadding) + mapPadding;
                                };

                                try {
                                    if (feature.geometry.type === 'Polygon') {
                                        if (Array.isArray(coordinates[0])) {
                                            coordinates[0].forEach((coord: any, i: number) => {
                                                if (Array.isArray(coord) && coord.length >= 2) {
                                                    const x = parseFloat(coord[0]);
                                                    const y = parseFloat(coord[1]);

                                                    if (!isNaN(x) && !isNaN(y) &&
                                                        x >= bounds.minX && x <= bounds.maxX &&
                                                        y >= bounds.minY && y <= bounds.maxY) {
                                                        const scaledX = scaleX(x);
                                                        const scaledY = scaleY(y);

                                                        if (i === 0) {
                                                            pathData += `M ${scaledX} ${scaledY}`;
                                                        } else {
                                                            pathData += ` L ${scaledX} ${scaledY}`;
                                                        }
                                                    }
                                                }
                                            });
                                            if (pathData) pathData += ' Z';
                                        }
                                    } else if (feature.geometry.type === 'MultiPolygon') {
                                        coordinates.forEach((polygon: any) => {
                                            if (Array.isArray(polygon) && Array.isArray(polygon[0])) {
                                                polygon[0].forEach((coord: any, i: number) => {
                                                    if (Array.isArray(coord) && coord.length >= 2) {
                                                        const x = parseFloat(coord[0]);
                                                        const y = parseFloat(coord[1]);

                                                        if (!isNaN(x) && !isNaN(y) &&
                                                            x >= bounds.minX && x <= bounds.maxX &&
                                                            y >= bounds.minY && y <= bounds.maxY) {
                                                            const scaledX = scaleX(x);
                                                            const scaledY = scaleY(y);

                                                            if (i === 0) {
                                                                pathData += `M ${scaledX} ${scaledY}`;
                                                            } else {
                                                                pathData += ` L ${scaledX} ${scaledY}`;
                                                            }
                                                        }
                                                    }
                                                });
                                                if (pathData && !pathData.endsWith('Z')) pathData += ' Z ';
                                            }
                                        });
                                    }

                                    if (pathData && pathData.trim().length > 10) {
                                        return (
                                            <Path
                                                key={`${stateName}-${index}`}
                                                d={pathData}
                                                fill={stateColor}
                                                stroke="#FFFFFF"
                                                strokeWidth={screenWidth > 400 ? 1 : 0.8}
                                                onPress={() => handleStatePress(stateName)}
                                                opacity={0.9}
                                            />
                                        );
                                    }
                                } catch (error) {
                                    console.warn(`Error processing state: ${stateName}`, error);
                                }

                                return null;
                            })}
                        </G>
                    </Svg>
                </View>

                {/* Responsive grid for featured states */}
                <View style={styles.statesGrid}>
                    {Object.entries(translatedStateData)
                        .slice(0, screenWidth > 400 ? 8 : 6)
                        .map(([stateKey, state]) => (
                            <TouchableOpacity
                                key={stateKey}
                                style={[
                                    styles.stateButton,
                                    {
                                        backgroundColor: getStateColor(state.name),
                                        width: screenWidth > 400 ? '23%' : '48%'
                                    }
                                ]}
                                onPress={() => handleStatePress(state.name)}
                            >
                                <Text style={[
                                    styles.stateButtonText,
                                    { fontSize: screenWidth > 400 ? 11 : 10 }
                                ]}>
                                    {state.name.length > 12 ?
                                        state.name.substring(0, 10) + '...' :
                                        state.name
                                    }
                                </Text>
                            </TouchableOpacity>
                        ))}
                </View>

                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => setAllStatesModalVisible(true)}
                >
                    <Text style={styles.viewAllText}>
                        {translatedTexts.viewAllStates || 'View All States'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderStateDetails = () => {
        if (!selectedState) return null;

        const state = translatedStateData[selectedState];
        if (!state) return null;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{state.name}</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.infoSection}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>{translatedTexts.totalSeats || 'Total Seats'}:</Text>
                                    <Text style={styles.infoValue}>{state.totalSeats}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>{translatedTexts.chiefMinister || 'Chief Minister'}:</Text>
                                    <Text style={styles.infoValue}>{state.cm}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>{translatedTexts.governor || 'Governor'}:</Text>
                                    <Text style={styles.infoValue}>{state.governor}</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>{translatedTexts.seatDistribution || 'Seat Distribution'}</Text>

                            <View style={styles.partiesContainer}>
                                {Object.entries(state.parties)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([party, seats]) => (
                                        <View key={party} style={styles.partyCard}>
                                            <View style={styles.partyHeader}>
                                                <View
                                                    style={[
                                                        styles.partyColorDot,
                                                        { backgroundColor: partyColors[party] || '#808080' }
                                                    ]}
                                                />
                                                <Text style={styles.partyName}>{party}</Text>
                                            </View>
                                            <View style={styles.partySeats}>
                                                <Text style={styles.seatsNumber}>{seats}</Text>
                                                <Text style={styles.seatsText}>{translatedTexts.seats || 'seats'}</Text>
                                            </View>
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        {
                                                            width: `${(seats / state.totalSeats) * 100}%`,
                                                            backgroundColor: partyColors[party] || '#808080'
                                                        }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.percentage}>
                                                {((seats / state.totalSeats) * 100).toFixed(1)}%
                                            </Text>
                                        </View>
                                    ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderLegend = () => {
        const majorParties = ['BJP', 'INC', 'AAP', 'DMK', 'AITC', 'Others'];

        return (
            <View style={styles.legendContainer}>
                <Text style={styles.legendTitle}>{translatedTexts.majorParties || 'Major Parties'}</Text>
                <View style={styles.legendGrid}>
                    {majorParties.map(party => (
                        <View key={party} style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: partyColors[party] || '#808080' }
                                ]}
                            />
                            <Text style={styles.legendText}>{party}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.push('/dashboard')}
                        >
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                        <LanguageSelector />
                    </View>
                    <Text style={[styles.title, { fontSize: screenWidth > 400 ? 28 : 24 }]}>
                        {translatedTexts.electionResults || 'Election Results'}
                    </Text>
                    <Text style={[styles.subtitle, { fontSize: screenWidth > 400 ? 16 : 14 }]}>
                        {translatedTexts.stateAssemblyResults || 'State Assembly Election Results 2024'}
                    </Text>
                </View>

                {renderInteractiveMap()}
                {renderLegend()}
                {renderStateDetails()}
                {renderAllStatesModal()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        padding: screenWidth > 400 ? 20 : 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#4F46E5',
        fontWeight: 'bold',
    },
    title: {
        fontSize: screenWidth > 400 ? 28 : 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: screenWidth > 400 ? 16 : 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 20,
    },
    mapContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: screenWidth > 400 ? 20 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center', // Center the map
    },
    svgContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 10,
        width: '100%',
        overflow: 'hidden',
        minHeight: screenWidth > 400 ? 300 : 250, // Minimum height
    },
    mapSvg: {
        backgroundColor: 'transparent',
    },
    mapTitle: {
        fontSize: screenWidth > 400 ? 16 : 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '500',
        paddingHorizontal: 10,
        lineHeight: 20,
    },
    statesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 15,
        width: '100%',
    },
    stateButton: {
        padding: screenWidth > 400 ? 12 : 10,
        marginBottom: 8,
        borderRadius: 8,
        alignItems: 'center',
        minHeight: screenWidth > 400 ? 50 : 45,
        justifyContent: 'center',
    },
    stateButtonText: {
        fontSize: screenWidth > 400 ? 11 : 10,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        lineHeight: 14,
    },
    viewAllButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: screenWidth > 400 ? 12 : 10,
        paddingHorizontal: screenWidth > 400 ? 24 : 20,
        borderRadius: 8,
        alignSelf: 'center',
        marginTop: 16,
    },
    viewAllText: {
        color: '#FFFFFF',
        fontSize: screenWidth > 400 ? 16 : 14,
        fontWeight: '600',
    },

    // Enhanced modal styles for better responsiveness
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: screenWidth > 400 ? '85%' : '90%',
        minHeight: '50%',
    },
    allStatesModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: screenWidth > 400 ? '90%' : '95%',
        minHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: screenWidth > 400 ? 20 : 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: screenWidth > 400 ? 22 : 18,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    closeButton: {
        padding: 8,
        marginLeft: 10,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#6B7280',
    },
    modalBody: {
        padding: screenWidth > 400 ? 20 : 16,
    },
    infoSection: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        flex: 0.4,
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
        flex: 0.6,
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: screenWidth > 400 ? 18 : 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    partiesContainer: {
        gap: 12,
    },
    partyCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 16,
    },
    partyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    partyColorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    partyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    partySeats: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    seatsNumber: {
        fontSize: screenWidth > 400 ? 24 : 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginRight: 4,
    },
    seatsText: {
        fontSize: 14,
        color: '#6B7280',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    percentage: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'right',
    },
    allStatesGrid: {
        paddingBottom: 20,
    },
    stateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    stateCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    stateCardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    stateCardDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    stateCardSeats: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    stateCardParty: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    stateCardCM: {
        fontSize: 13,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    legendContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: screenWidth > 400 ? 20 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legendTitle: {
        fontSize: screenWidth > 400 ? 18 : 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    legendGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: screenWidth > 400 ? '31%' : '48%',
        marginBottom: 12,
    },
    legendDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 8,
    },
    legendText: {
        fontSize: screenWidth > 400 ? 14 : 12,
        color: '#374151',
        fontWeight: '500',
    },
});