import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
const FAQ = () => {
    const router = useRouter();

    const faqData = [
        {
            category: "Voter Registration & Eligibility",
            questions: [
                {
                    id: "reg1",
                    question: "Who is eligible to vote in India?",
                    answer: "Any Indian citizen who has completed 18 years of age on the qualifying date (January 1st of the year of revision of electoral roll) and is not disqualified under any law is eligible to vote."
                },
                {
                    id: "reg2",
                    question: "How can I check if I'm registered to vote?",
                    answer: "You can check your voter registration status on the National Voters' Service Portal (NVSP) at nvsp.in or through the Voter Helpline App. You need your details like name, father's name, age, or EPIC number."
                },
                {
                    id: "reg3",
                    question: "What documents do I need to register as a voter?",
                    answer: "You need proof of identity (Aadhaar, Passport, Driving License, etc.), proof of address, and proof of age. Form 6 needs to be filled for new registration."
                }
            ]
        },
        {
            category: "Before Election Day",
            questions: [
                {
                    id: "before1",
                    question: "How do I find my polling station?",
                    answer: "You can find your polling station details through the Voter Helpline App, NVSP portal, or by checking your Voter ID card. The polling station address is printed on your EPIC card."
                },
                {
                    id: "before2",
                    question: "What documents should I carry on election day?",
                    answer: "Carry any one of these photo identity documents: Voter ID (EPIC), Aadhaar Card, Passport, Driving License, PAN Card, Service Identity Card, Passbook with photograph issued by Bank/Post Office, Health Insurance Smart Card, MGNREGA Job Card, or Pension Document with photograph."
                },
                {
                    id: "before3",
                    question: "Can I vote if I forget my ID card?",
                    answer: "No, carrying a valid photo identity document is mandatory for voting. Without proper ID, you will not be allowed to vote."
                }
            ]
        },
        {
            category: "On Election Day",
            questions: [
                {
                    id: "day1",
                    question: "What are the polling hours?",
                    answer: "Generally, polling is conducted from 7:00 AM to 6:00 PM. However, timings may vary in certain constituencies. Check your local election commission notification for exact timings."
                },
                {
                    id: "day2",
                    question: "What is the voting process?",
                    answer: "1. Queue at your polling station\n2. Show your photo ID to the polling officer\n3. Get your finger marked with indelible ink\n4. Sign/put thumb impression in the register\n5. Receive ballot paper or use EVM\n6. Cast your vote in secret\n7. Verify VVPAT slip\n8. Exit the polling station"
                },
                {
                    id: "day3",
                    question: "What is VVPAT and why is it important?",
                    answer: "VVPAT (Voter Verified Paper Audit Trail) is a device that allows voters to verify that their vote was cast correctly. After pressing the button on EVM, a printed slip shows your chosen candidate for 7 seconds before dropping into a sealed box."
                },
                {
                    id: "day4",
                    question: "Can I use my mobile phone inside the polling booth?",
                    answer: "No, mobile phones are strictly prohibited inside the polling booth. You cannot take photos or videos of your ballot or the voting process."
                }
            ]
        },
        {
            category: "Voter Rights & NOTA",
            questions: [
                {
                    id: "rights1",
                    question: "What is NOTA?",
                    answer: "NOTA stands for 'None of The Above'. It's an option that allows voters to officially register their rejection of all candidates. The NOTA button is the last option on the EVM."
                },
                {
                    id: "rights2",
                    question: "What are my rights as a voter?",
                    answer: "Your rights include: Right to vote freely without influence, Right to know about candidates, Right to vote in secret, Right to accessibility if you're differently-abled, Right to get assistance if you're 80+ years or have disabilities, and Right to complain about election-related issues."
                },
                {
                    id: "rights3",
                    question: "Can someone help me vote if I have disabilities?",
                    answer: "Yes, voters with disabilities, blindness, or those above 80 years can take a companion to help them vote. The companion must be above 18 years and carry valid ID. Blind voters can also use Braille-enabled EVMs."
                }
            ]
        },
        {
            category: "Prohibited Activities",
            questions: [
                {
                    id: "prohibited1",
                    question: "What activities are prohibited on election day?",
                    answer: "Prohibited activities include: Campaigning within 200 meters of polling station, Carrying mobile phones inside polling booth, Taking photos/videos of ballot, Accepting money/gifts for votes, Consuming or distributing liquor, Creating disturbance at polling station."
                },
                {
                    id: "prohibited2",
                    question: "Can I campaign for my candidate on election day?",
                    answer: "No, all campaigning activities must stop 48 hours before polling begins. No campaigning is allowed on election day, especially within 200 meters of any polling station."
                },
                {
                    id: "prohibited3",
                    question: "What happens if I try to vote twice?",
                    answer: "Attempting to vote more than once is a serious electoral offense. The indelible ink on your finger prevents multiple voting, and if caught, you can face legal action including imprisonment."
                }
            ]
        },
        {
            category: "Special Circumstances",
            questions: [
                {
                    id: "special1",
                    question: "What if I'm posted away from my home constituency?",
                    answer: "You can apply for postal ballot if you're in essential services, or you can get your vote transferred to your current location constituency through Form 8A before the deadline."
                },
                {
                    id: "special2",
                    question: "Can I vote if I'm in quarantine or have COVID-19?",
                    answer: "Special provisions are made during health emergencies. COVID-positive voters can vote in the last hour of polling with proper protective equipment. Check with local election authorities for current guidelines."
                },
                {
                    id: "special3",
                    question: "What should I do if I face problems at the polling station?",
                    answer: "You can complain to the Presiding Officer at the polling station, contact the Returning Officer, call the election helpline, or use the cVIGIL app to report violations immediately."
                }
            ]
        }
    ];

    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
    const [translatedFaqData, setTranslatedFaqData] = useState(faqData);

    const { t, currentLanguage } = useTranslation();

    const toggleExpanded = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    // Translation effect
    useEffect(() => {
        const translateTexts = async () => {
            if (currentLanguage === 'en') {
                setTranslatedTexts({});
                setTranslatedFaqData(faqData);
                return;
            }

            const textsToTranslate = {
                faqTitle: 'Frequently Asked Questions',
                faqSubtitle: 'Essential information for Indian voters based on Election Commission of India guidelines',
                needMoreHelp: 'Need More Help?',
                helpSubtitle: 'For additional information or assistance, contact the Election Commission of India',
                voterHelpline: 'Voter Helpline',
                website: 'Website',
                mobileApp: 'Mobile App',
                voterHelplineApp: 'Voter Helpline App'
            };

            const translated: Record<string, string> = {};
            for (const [key, text] of Object.entries(textsToTranslate)) {
                translated[key] = await t(key, text);
            }
            setTranslatedTexts(translated);

            // Translate FAQ data
            const translatedFaq = await Promise.all(
                faqData.map(async (category) => ({
                    ...category,
                    category: await t(`category_${category.category.replace(/\s+/g, '_').toLowerCase()}`, category.category),
                    questions: await Promise.all(
                        category.questions.map(async (question) => ({
                            ...question,
                            question: await t(`question_${question.id}`, question.question),
                            answer: await t(`answer_${question.id}`, question.answer)
                        }))
                    )
                }))
            );
            setTranslatedFaqData(translatedFaq);
        };

        translateTexts();
    }, [currentLanguage]); // Remove 't' from dependencies to prevent infinite loop

    const handleContactPress = (type: string) => {
        switch (type) {
            case 'phone':
                Linking.openURL('tel:1950');
                break;
            case 'website':
                Linking.openURL('https://eci.gov.in');
                break;
            default:
                break;
        }
    };

    const renderQuestion = (question: any) => {
        const isExpanded = expandedItems.includes(question.id);

        return (
            <View key={question.id} style={styles.questionContainer}>
                <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() => toggleExpanded(question.id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.questionText}>{question.question}</Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#4F46E5"
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>{question.answer}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                        <LanguageSelector />
                    </View>
                    <Text style={styles.title}>{translatedTexts.faqTitle || 'Frequently Asked Questions'}</Text>
                    <Text style={styles.subtitle}>
                        {translatedTexts.faqSubtitle || 'Essential information for Indian voters based on Election Commission of India guidelines'}
                    </Text>
                </View>

                {translatedFaqData.map((category, categoryIndex) => (
                    <View key={categoryIndex} style={styles.categoryContainer}>
                        <Text style={styles.categoryTitle}>{category.category}</Text>
                        {category.questions.map(renderQuestion)}
                    </View>
                ))}

                <View style={styles.helpContainer}>
                    <Text style={styles.helpTitle}>{translatedTexts.needMoreHelp || 'Need More Help?'}</Text>
                    <Text style={styles.helpSubtitle}>
                        {translatedTexts.helpSubtitle || 'For additional information or assistance, contact the Election Commission of India'}
                    </Text>

                    <View style={styles.contactGrid}>
                        <TouchableOpacity
                            style={styles.contactCard}
                            onPress={() => handleContactPress('phone')}
                        >
                            <Ionicons name="call" size={24} color="#FFFFFF" />
                            <Text style={styles.contactTitle}>{translatedTexts.voterHelpline || 'Voter Helpline'}</Text>
                            <Text style={styles.contactInfo}>1950</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.contactCard}
                            onPress={() => handleContactPress('website')}
                        >
                            <Ionicons name="globe" size={24} color="#FFFFFF" />
                            <Text style={styles.contactTitle}>{translatedTexts.website || 'Website'}</Text>
                            <Text style={styles.contactInfo}>eci.gov.in</Text>
                        </TouchableOpacity>

                        <View style={styles.contactCard}>
                            <Ionicons name="phone-portrait" size={24} color="#FFFFFF" />
                            <Text style={styles.contactTitle}>{translatedTexts.mobileApp || 'Mobile App'}</Text>
                            <Text style={styles.contactInfo}>{translatedTexts.voterHelplineApp || 'Voter Helpline App'}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    categoryContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4F46E5',
        marginBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#E0E7FF',
        paddingBottom: 8,
    },
    questionContainer: {
        marginBottom: 12,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        marginRight: 12,
    },
    answerContainer: {
        backgroundColor: '#EFF6FF',
        padding: 16,
        marginTop: 8,
        borderRadius: 8,
    },
    answerText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    helpContainer: {
        backgroundColor: '#4F46E5',
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    helpTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    helpSubtitle: {
        fontSize: 16,
        color: '#E0E7FF',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    contactGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    contactCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        width: '30%',
        minWidth: 90,
        marginBottom: 8,
    },
    contactTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
    contactInfo: {
        fontSize: 11,
        color: '#E0E7FF',
        textAlign: 'center',
    },
});

export default FAQ;