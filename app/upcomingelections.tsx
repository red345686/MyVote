import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LanguageSelector } from '../components/LanguageSelector'
import { useTranslation } from '../hooks/useTranslation'

// Mock JSON data for upcoming elections
const electionsData = [
    {
        id: 1,
        title: "General Elections 2024",
        date: "2024-07-15",
        time: "09:00 AM - 06:00 PM",
        location: "All Constituencies",
        type: "General",
        status: "upcoming",
        description: "National parliamentary elections to elect representatives for the next 5 years.",
        candidates: 1247,
        constituencies: 543,
        eligibleVoters: "970 Million",
        icon: "🏛️",
        color: "#dc2626"
    },
    {
        id: 2,
        title: "State Assembly Elections - Karnataka",
        date: "2024-08-22",
        time: "08:00 AM - 05:00 PM",
        location: "Karnataka State",
        type: "State",
        status: "upcoming",
        description: "State legislative assembly elections for Karnataka constituencies.",
        candidates: 156,
        constituencies: 224,
        eligibleVoters: "50 Million",
        icon: "🏢",
        color: "#2563eb"
    },
    {
        id: 3,
        title: "Municipal Corporation Elections",
        date: "2024-09-10",
        time: "09:00 AM - 05:00 PM",
        location: "Delhi NCR",
        type: "Local",
        status: "upcoming",
        description: "Local municipal corporation elections for Delhi and surrounding areas.",
        candidates: 89,
        constituencies: 75,
        eligibleVoters: "15 Million",
        icon: "🏘️",
        color: "#059669"
    },
    {
        id: 4,
        title: "Panchayat Elections",
        date: "2024-10-05",
        time: "10:00 AM - 04:00 PM",
        location: "Rural Areas - UP",
        type: "Rural",
        status: "registration",
        description: "Village panchayat elections for rural development and governance.",
        candidates: 234,
        constituencies: 180,
        eligibleVoters: "25 Million",
        icon: "🌾",
        color: "#7c3aed"
    }
]

export default function UpcomingElections() {
    const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({})
    const [translatedElections, setTranslatedElections] = useState(electionsData)
    const { t, currentLanguage } = useTranslation()

    // Translation effect
    useEffect(() => {
        const translateTexts = async () => {
            if (currentLanguage === 'en') {
                setTranslatedTexts({});
                setTranslatedElections(electionsData);
                return;
            }

            const textsToTranslate = {
                upcomingElections: 'Upcoming Elections',
                backToDashboard: 'Back to Dashboard',
                electionDate: 'Election Date',
                votingTime: 'Voting Time',
                location: 'Location',
                type: 'Type',
                candidates: 'Candidates',
                constituencies: 'Constituencies',
                eligibleVoters: 'Eligible Voters',
                learnMore: 'Learn More',
                registrationOpen: 'Registration Open',
                votingSoon: 'Voting Soon',
                general: 'General',
                state: 'State',
                local: 'Local',
                rural: 'Rural',
                upcoming: 'Upcoming',
                registration: 'Registration Phase',
                noElections: 'No upcoming elections found',
                details: 'View Details'
            };

            const translated: Record<string, string> = {};
            for (const [key, text] of Object.entries(textsToTranslate)) {
                translated[key] = await t(key, text);
            }
            setTranslatedTexts(translated);

            // Translate election data
            const translatedElectionsData = await Promise.all(
                electionsData.map(async (election) => ({
                    ...election,
                    title: await t(`election_title_${election.id}`, election.title),
                    description: await t(`election_desc_${election.id}`, election.description),
                    location: await t(`election_location_${election.id}`, election.location),
                }))
            );
            setTranslatedElections(translatedElectionsData);
        };

        translateTexts();
    }, [currentLanguage]); // Remove 't' from dependencies to prevent infinite loop

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return '#059669'
            case 'registration': return '#d97706'
            default: return '#6b7280'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'upcoming': return translatedTexts.votingSoon || 'Voting Soon'
            case 'registration': return translatedTexts.registrationOpen || 'Registration Open'
            default: return status
        }
    }

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'general': return '#dc2626'
            case 'state': return '#2563eb'
            case 'local': return '#059669'
            case 'rural': return '#7c3aed'
            default: return '#6b7280'
        }
    }

    const ElectionCard = ({ election }: { election: typeof electionsData[0] }) => (
        <TouchableOpacity
            style={[styles.electionCard, { borderLeftColor: election.color }]}
            activeOpacity={0.7}
            onPress={() => {
                // Navigate to election details page
                console.log('Navigate to election details:', election.id)
            }}
        >
            <View style={styles.cardHeader}>
                <View style={styles.titleSection}>
                    <Text style={styles.electionIcon}>{election.icon}</Text>
                    <View style={styles.titleText}>
                        <Text style={styles.electionTitle}>{election.title}</Text>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(election.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(election.status) }]}>
                                {getStatusText(election.status)}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(election.type) }]}>
                    <Text style={styles.typeText}>
                        {translatedTexts[election.type.toLowerCase()] || election.type}
                    </Text>
                </View>
            </View>

            <Text style={styles.electionDescription}>{election.description}</Text>

            <View style={styles.electionDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{translatedTexts.electionDate || 'Election Date'}</Text>
                        <Text style={styles.detailValue}>{formatDate(election.date)}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>⏰</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{translatedTexts.votingTime || 'Voting Time'}</Text>
                        <Text style={styles.detailValue}>{election.time}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{translatedTexts.location || 'Location'}</Text>
                        <Text style={styles.detailValue}>{election.location}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsSection}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{election.candidates}</Text>
                    <Text style={styles.statLabel}>{translatedTexts.candidates || 'Candidates'}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{election.constituencies}</Text>
                    <Text style={styles.statLabel}>{translatedTexts.constituencies || 'Constituencies'}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{election.eligibleVoters}</Text>
                    <Text style={styles.statLabel}>{translatedTexts.eligibleVoters || 'Eligible Voters'}</Text>
                </View>
            </View>

            <TouchableOpacity style={[styles.learnMoreButton, { backgroundColor: election.color }]}>
                <Text style={styles.learnMoreText}>{translatedTexts.details || 'View Details'}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    )

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>←</Text>
                    <Text style={styles.backText}>{translatedTexts.backToDashboard || 'Back to Dashboard'}</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{translatedTexts.upcomingElections || 'Upcoming Elections'}</Text>

                <LanguageSelector />
            </View>

            {/* Elections List */}
            <View style={styles.electionsContainer}>
                {translatedElections.length > 0 ? (
                    translatedElections.map((election) => (
                        <ElectionCard key={election.id} election={election} />
                    ))
                ) : (
                    <View style={styles.noElectionsContainer}>
                        <Text style={styles.noElectionsIcon}>🗳️</Text>
                        <Text style={styles.noElectionsText}>
                            {translatedTexts.noElections || 'No upcoming elections found'}
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#2563eb',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        flexDirection: 'column',
        gap: 15,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    backIcon: {
        fontSize: 20,
        color: 'white',
        marginRight: 8,
    },
    backText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    electionsContainer: {
        padding: 20,
        paddingTop: 10,
    },
    electionCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderLeftWidth: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    electionIcon: {
        fontSize: 32,
        marginRight: 15,
    },
    titleText: {
        flex: 1,
    },
    electionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    typeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    electionDescription: {
        fontSize: 15,
        color: '#6b7280',
        lineHeight: 22,
        marginBottom: 20,
    },
    electionDetails: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailIcon: {
        fontSize: 18,
        marginRight: 12,
        width: 25,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
        marginTop: 2,
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: 11,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 4,
    },
    learnMoreButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    learnMoreText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    noElectionsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    noElectionsIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    noElectionsText: {
        fontSize: 18,
        color: '#6b7280',
        textAlign: 'center',
    },
})