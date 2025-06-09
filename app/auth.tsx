import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const sendOTP = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      })
      
      if (error) {
        Alert.alert('Error', error.message)
      } else {
        setOtpSent(true)
        Alert.alert('Success', 'OTP sent to your phone!')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      })
      
      if (error) {
        Alert.alert('Error', error.message)
      }
      // Success will be handled by the auth state change listener
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Authentication</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter phone number (+1234567890)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!otpSent}
      />
      
      {otpSent && (
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
        />
      )}
      
      <TouchableOpacity
        style={styles.button}
        onPress={otpSent ? verifyOTP : sendOTP}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : otpSent ? 'Verify OTP' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
      
      {otpSent && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            setOtpSent(false)
            setOtp('')
          }}
        >
          <Text style={styles.linkText}>Change phone number</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
})