import { Session } from '@supabase/supabase-js'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LanguageSelector } from '../components/LanguageSelector'
import { useTranslation } from '../hooks/useTranslation'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [isRegisteredVoter, setIsRegisteredVoter] = useState(false)
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({})

  const { t, tSync, currentLanguage } = useTranslation()
  const params = useLocalSearchParams();
  const extractedPhone = Array.isArray(params.extractedPhone) ? params.extractedPhone[0] : params.extractedPhone;
  const extractedAadhar = Array.isArray(params.extractedAadhar) ? params.extractedAadhar[0] : params.extractedAadhar;
  const voterRegistered = Array.isArray(params.voterRegistered) ? params.voterRegistered[0] : params.voterRegistered;
  const alreadyRegistered = Array.isArray(params.alreadyRegistered) ? params.alreadyRegistered[0] : params.alreadyRegistered;

  // Translation effect
  useEffect(() => {
    const translateTexts = async () => {
      if (currentLanguage === 'en') {
        setTranslatedTexts({});
        return;
      }

      const textsToTranslate = {
        welcome: 'Welcome to MyVote',
        signOut: 'Sign Out',
        signingOut: 'Signing out...',
        registeredVoter: 'Registered Voter',
        verifiedUser: 'Verified User',
        verificationRequired: 'Verification Required',
        registeredMessage: 'You are registered and ready to vote',
        verifiedMessage: 'Identity verified - Register to vote',
        verificationNeeded: 'Complete verification to proceed',
        getVerified: 'Get Verified',
        registerToVote: 'Register to Vote',
        yourVoterId: 'Your Voter ID',
        qrCode: 'QR Code',
        tapToView: 'Tap to view full QR code',
        upcomingElections: 'Upcoming Elections',
        viewPolls: 'View upcoming polls',
        results: 'Results',
        electionResults: 'Election results',
        faqs: 'FAQs',
        frequentlyAsked: 'Frequently asked questions',
        contactUs: 'Contact Us',
        getHelp: 'Get help & support',
        accountInfo: 'Account Information',
        userId: 'User ID:',
        lastSignIn: 'Last Sign In:',
        comingSoon: 'feature coming soon!',
        aadharNotMatched: 'Aadhar number not matched',
        phoneNotMatch: 'The phone number on your Aadhar does not match your login.',
        errorTitle: 'Error',
        failedSignOut: 'Failed to sign out',
        info: 'Info'
      };

      const translated: Record<string, string> = {};
      for (const [key, text] of Object.entries(textsToTranslate)) {
        translated[key] = await t(key, text);
      }
      setTranslatedTexts(translated);
    };

    translateTexts();
  }, [currentLanguage]); // Remove 't' from dependencies to prevent infinite loop

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (extractedPhone && session?.user?.phone) {
      // Remove country code for comparison if needed
      const userPhone = session.user.phone.replace(/^\+91/, '').replace(/^\+/, '');
      if (userPhone.endsWith(extractedPhone)) {
        setIsVerified(true);
        // If user came from verification with successful registration or already registered
        if (voterRegistered === 'true' || alreadyRegistered === 'true') {
          setIsRegisteredVoter(true);
          setShowQR(true);
        }
      } else {
        // Use a ref or state to prevent infinite re-renders
        if (Object.keys(translatedTexts).length > 0) {
          Alert.alert(
            translatedTexts.aadharNotMatched || 'Aadhar number not matched',
            translatedTexts.phoneNotMatch || 'The phone number on your Aadhar does not match your login.'
          );
        }
        setIsVerified(false);
      }
    }
  }, [extractedPhone, session, voterRegistered, alreadyRegistered]); // Remove translatedTexts from dependencies

  // Add function to check registration status on load
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (session?.user?.user_metadata?.aadhar_number) {
        try {
          const response = await fetch(
            `https://notional-yeti-461501-r9.uc.r.appspot.com/api/voters/status/aadhar/${session.user.user_metadata.aadhar_number}`
          );
          if (response.ok) {
            setIsRegisteredVoter(true);
            setIsVerified(true);
            setShowQR(true);
          }
        } catch (error) {
          console.log('No existing registration found');
        }
      }
    };

    if (session) {
      checkExistingRegistration();
    }
  }, [session]);

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        Alert.alert(translatedTexts.errorTitle || 'Error', error.message)
      }
    } catch (error) {
      Alert.alert(translatedTexts.errorTitle || 'Error', translatedTexts.failedSignOut || 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const handleGetVerified = () => {
    // Navigate to verification page
    router.push('/verification')
  }

  type MenuCardProps = {
    title: string
    subtitle: string
    onPress: () => void
    icon: React.ReactNode
  }

  const MenuCard = ({ title, subtitle, onPress, icon }: MenuCardProps) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress}>
      <View style={styles.menuCardContent}>
        <Text style={styles.menuCardIcon}>{icon}</Text>
        <Text style={styles.menuCardTitle}>{title}</Text>
        <Text style={styles.menuCardSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>{translatedTexts.welcome || 'Welcome to MyVote'}</Text>
        <Text style={styles.phoneText}>{session?.user?.phone || 'User'}</Text>
        <View style={styles.headerButtons}>
          <LanguageSelector />
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={signOut}
            disabled={loading}
          >
            <Text style={styles.signOutText}>
              {loading ? (translatedTexts.signingOut || 'Signing out...') : (translatedTexts.signOut || 'Sign Out')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Verification Status Section */}
      <View style={styles.verificationSection}>
        <View style={[styles.verificationCard, isVerified ? styles.verifiedCard : styles.unverifiedCard]}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>{isVerified ? '✓' : '⚠️'}</Text>
            <View>
              <Text style={styles.statusTitle}>
                {isVerified
                  ? (isRegisteredVoter ? (translatedTexts.registeredVoter || 'Registered Voter') : (translatedTexts.verifiedUser || 'Verified User'))
                  : (translatedTexts.verificationRequired || 'Verification Required')
                }
              </Text>
              <Text style={styles.statusSubtitle}>
                {isVerified
                  ? (isRegisteredVoter
                    ? (translatedTexts.registeredMessage || 'You are registered and ready to vote')
                    : (translatedTexts.verifiedMessage || 'Identity verified - Register to vote')
                  )
                  : (translatedTexts.verificationNeeded || 'Complete verification to proceed')
                }
              </Text>
            </View>
          </View>

          {!isVerified && (
            <TouchableOpacity style={styles.verifyButton} onPress={handleGetVerified}>
              <Text style={styles.verifyButtonText}>{translatedTexts.getVerified || 'Get Verified'}</Text>
            </TouchableOpacity>
          )}

          {isVerified && !isRegisteredVoter && (
            <TouchableOpacity style={styles.verifyButton} onPress={handleGetVerified}>
              <Text style={styles.verifyButtonText}>{translatedTexts.registerToVote || 'Register to Vote'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* QR Code Section - Only show when verified and registered */}
      {showQR && isVerified && isRegisteredVoter && (
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>{translatedTexts.yourVoterId || 'Your Voter ID'}</Text>
          <TouchableOpacity
            style={styles.qrContainer}
            onPress={() => router.push('/qrcode')}
            activeOpacity={0.7}
          >
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrIcon}>📱</Text>
              <Text style={styles.qrText}>{translatedTexts.qrCode || 'QR Code'}</Text>
              <Text style={styles.qrSubtext}>{translatedTexts.tapToView || 'Tap to view full QR code'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Grid */}
      <View style={styles.menuGrid}>
        <View style={styles.menuRow}>
          <MenuCard
            title={translatedTexts.upcomingElections || "Upcoming Elections"}
            subtitle={translatedTexts.viewPolls || "View upcoming polls"}
            icon="🗳️"
            onPress={() => router.push('/upcomingelections')}
          />
          <MenuCard
            title={translatedTexts.results || "Results"}
            subtitle={translatedTexts.electionResults || "Election results"}
            icon="📊"
            onPress={() => router.push('/results')}
          />
        </View>

        <View style={styles.menuRow}>
          <MenuCard
            title={translatedTexts.faqs || "FAQs"}
            subtitle={translatedTexts.frequentlyAsked || "Frequently asked questions"}
            icon="❓"
            onPress={() => router.push('/faq')}
          />
          <MenuCard
            title={translatedTexts.contactUs || "Contact Us"}
            subtitle={translatedTexts.getHelp || "Get help & support"}
            icon="📞"
            onPress={() => Alert.alert(translatedTexts.info || 'Info', `${translatedTexts.contactUs || 'Contact'} ${translatedTexts.comingSoon || 'feature coming soon!'}`)}
          />
        </View>
      </View>

      {/* User Info Section */}
      <View style={styles.userInfoSection}>
        <Text style={styles.userInfoTitle}>{translatedTexts.accountInfo || 'Account Information'}</Text>
        <View style={styles.userInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{translatedTexts.userId || 'User ID:'}</Text>
            <Text style={styles.infoValue}>{session?.user?.id?.slice(0, 8) || 'N/A'}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{translatedTexts.lastSignIn || 'Last Sign In:'}</Text>
            <Text style={styles.infoValue}>
              {session?.user?.last_sign_in_at
                ? new Date(session.user.last_sign_in_at).toLocaleDateString()
                : 'N/A'
              }
            </Text>
          </View>
        </View>
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
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  phoneText: {
    fontSize: 16,
    color: '#bfdbfe',
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signOutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  verificationSection: {
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  verificationCard: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  verifiedCard: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
  },
  unverifiedCard: {
    backgroundColor: 'white',
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  verifyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  qrSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  qrIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  qrSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  menuGrid: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  menuCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  menuCardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  menuCardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  userInfoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  userInfoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
})