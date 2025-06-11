import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { router } from 'expo-router'

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        Alert.alert('Error', error.message)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out')
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
        <Text style={styles.welcomeText}>Welcome to MyVote</Text>
        <Text style={styles.phoneText}>{session?.user?.phone || 'User'}</Text>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
          disabled={loading}
        >
          <Text style={styles.signOutText}>
            {loading ? 'Signing out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Verification Status Section */}
      <View style={styles.verificationSection}>
        <View style={[styles.verificationCard, isVerified ? styles.verifiedCard : styles.unverifiedCard]}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>{isVerified ? '✓' : '⚠️'}</Text>
            <View>
              <Text style={styles.statusTitle}>
                {isVerified ? 'Verified Voter' : 'Verification Required'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {isVerified 
                  ? 'Your identity has been verified' 
                  : 'Complete verification to vote'
                }
              </Text>
            </View>
          </View>
          
          {!isVerified && (
            <TouchableOpacity style={styles.verifyButton} onPress={handleGetVerified}>
              <Text style={styles.verifyButtonText}>Get Verified</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* QR Code Section - Only show when verified */}
      {showQR && isVerified && (
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Your Voter ID</Text>
          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrIcon}>📱</Text>
              <Text style={styles.qrText}>QR Code</Text>
              <Text style={styles.qrSubtext}>Show this at polling station</Text>
            </View>
          </View>
        </View>
      )}

      {/* Menu Grid */}
      <View style={styles.menuGrid}>
        <View style={styles.menuRow}>
          <MenuCard
            title="Upcoming Elections"
            subtitle="View upcoming polls"
            icon="🗳️"
            onPress={() => Alert.alert('Info', 'Upcoming Elections feature coming soon!')}
          />
          <MenuCard
            title="Results"
            subtitle="Election results"
            icon="📊"
            onPress={() => Alert.alert('Info', 'Results feature coming soon!')}
          />
        </View>
        
        <View style={styles.menuRow}>
          <MenuCard
            title="FAQs"
            subtitle="Frequently asked questions"
            icon="❓"
            onPress={() => Alert.alert('Info', 'FAQs feature coming soon!')}
          />
          <MenuCard
            title="Contact Us"
            subtitle="Get help & support"
            icon="📞"
            onPress={() => Alert.alert('Info', 'Contact feature coming soon!')}
          />
        </View>
      </View>

      {/* User Info Section */}
      <View style={styles.userInfoSection}>
        <Text style={styles.userInfoTitle}>Account Information</Text>
        <View style={styles.userInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue}>{session?.user?.id?.slice(0, 8) || 'N/A'}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Sign In:</Text>
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
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-end',
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