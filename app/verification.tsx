import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image, Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';

// Move API key to environment variables
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyC_8gpenp5BkrUeVyAVrrbt02K7sM6ipaI';
const VOTER_REGISTRATION_URL = 'https://notional-yeti-461501-r9.uc.r.appspot.com/api/voters/register-aadhar';

export default function Verification() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [userPhone, setUserPhone] = useState<string>('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    email: '',
    city: '',
    state: ''
  });
  const [registering, setRegistering] = useState(false);
  const router = useRouter();

  // Get user's phone number from session
  useEffect(() => {
    const getUserPhone = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.phone) {
          setUserPhone(session.user.phone);
        }
      } catch (error) {
        console.error('Error getting user phone:', error);
      }
    };
    getUserPhone();
  }, []);

  // Verify phone numbers match when extracted data is available
  useEffect(() => {
    if (extractedData && userPhone) {
      verifyPhoneNumbers();
    }
  }, [extractedData, userPhone]);

  // Add this new useEffect to automatically show registration form when phone is verified
  useEffect(() => {
    if (extractedData && phoneVerified) {
      setShowRegistrationForm(true);
    }
  }, [extractedData, phoneVerified]);

  const verifyPhoneNumbers = () => {
    if (!extractedData?.phone || !userPhone) {
      setPhoneVerified(false);
      return;
    }

    // Normalize phone numbers for comparison
    const normalizePhone = (phone: string) => {
      return phone.replace(/[\s\-\+()]/g, '').replace(/^91/, ''); // Remove spaces, dashes, plus, parentheses, and country code
    };

    const normalizedUserPhone = normalizePhone(userPhone);
    const normalizedExtractedPhone = normalizePhone(extractedData.phone);

    console.log('User Phone (normalized):', normalizedUserPhone);
    console.log('Extracted Phone (normalized):', normalizedExtractedPhone);

    // More robust phone number matching
    const isPhoneMatch = normalizedUserPhone === normalizedExtractedPhone ||
      normalizedUserPhone.endsWith(normalizedExtractedPhone) ||
      normalizedExtractedPhone.endsWith(normalizedUserPhone) ||
      normalizedUserPhone.includes(normalizedExtractedPhone) ||
      normalizedExtractedPhone.includes(normalizedUserPhone);

    if (isPhoneMatch) {
      setPhoneVerified(true);
      Alert.alert('✓ Phone Verified', 'Your phone number matches the Aadhar card. You can proceed with registration.');
    } else {
      setPhoneVerified(false);
      Alert.alert(
        '❌ Phone Mismatch',
        `The phone number on your Aadhar card (${extractedData.phone}) does not match your login phone number. Please ensure you're using the same phone number for both.`,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Try Again',
            onPress: resetForm
          }
        ]
      );
    }
  };

  const resetForm = () => {
    setExtractedData(null);
    setShowRegistrationForm(false);
    setImage(null);
    setPhoneVerified(false);
    setRegistrationData({
      email: '',
      city: '',
      state: ''
    });
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Reduce quality for better performance
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        // Reset previous data when new image is selected
        setExtractedData(null);
        setShowRegistrationForm(false);
        setPhoneVerified(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();

        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1]; // remove "data:image/jpeg;base64,"
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
      }
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  };

  const extractAadharData = async (imageUri: string) => {
    if (!GEMINI_API_KEY) {
      throw new Error('API key not configured');
    }

    const base64Image = await convertImageToBase64(imageUri);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this Aadhar card image and extract the following information. Return the data in this exact JSON format:
{
  "name": "extracted full name",
  "aadhar_number": "12-digit aadhar number with or without spaces/dashes",
  "date_of_birth": "DD/MM/YYYY or DD-MM-YYYY format",
  "gender": "Male or Female",
  "address": "complete address as written on card",
  "father_name": "father's name if visible",
  "phone": "phone number if visible, even if not explicitly labeled; look for 10-digit numbers that could be a phone number"
}

Important instructions:
- Extract text exactly as it appears on the card
- If any field is not clearly visible, use "Not visible" as the value
- For the phone number, look for any 10-digit number that could be a phone number, even if not labeled as such
- Return only the JSON object, no additional text
- Ensure all field names match exactly as specified above
- Pay special attention to the Aadhar number and phone number formats`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content received from API');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new Error('Failed to parse extracted data');
    }
  };

  const saveDataToFile = async (data: any) => {
    try {
      const fileName = `aadhar_data_${Date.now()}.json`;
      const jsonString = JSON.stringify(data, null, 2);

      if (Platform.OS === 'web') {
        // Web: trigger download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return fileName;
      } else {
        // Native: save to file system
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonString);
        return fileUri;
      }
    } catch (error) {
      console.error('Error saving data to file:', error);
      // Don't throw here as this is not critical for the main flow
    }
  };

  const validateRegistrationData = () => {
    const { email, city, state } = registrationData;

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email address is required');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!city.trim()) {
      Alert.alert('Validation Error', 'City is required');
      return false;
    }

    if (!state.trim()) {
      Alert.alert('Validation Error', 'State is required');
      return false;
    }

    return true;
  };

  const registerVoter = async () => {
    if (!extractedData) {
      Alert.alert('Error', 'No extracted data available');
      return;
    }

    if (!phoneVerified) {
      Alert.alert('Error', 'Phone number verification required before registration');
      return;
    }

    if (!validateRegistrationData()) {
      return;
    }

    setRegistering(true);

    try {
      // Convert date format from DD/MM/YYYY to YYYY-MM-DD
      const convertDateFormat = (dateString: string) => {
        if (!dateString || dateString === 'Not visible') return '';

        // Handle DD/MM/YYYY or DD-MM-YYYY format
        const dateRegex = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
        const match = dateString.match(dateRegex);

        if (match) {
          const [, day, month, year] = match;
          return `${year}-${month}-${day}`;
        }

        return dateString; // Return as is if format doesn't match
      };

      const voterRegistrationPayload = {
        name: extractedData.name || '',
        aadharNumber: extractedData.aadhar_number || '',
        dob: convertDateFormat(extractedData.date_of_birth || ''),
        phoneNumber: extractedData.phone || '',
        email: registrationData.email.trim(),
        city: registrationData.city.trim(),
        state: registrationData.state.trim(),
        gender: extractedData.gender || ''
      };

      console.log('Registration payload:', voterRegistrationPayload); // For debugging

      const response = await fetch(VOTER_REGISTRATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voterRegistrationPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Registration error response:', errorData);
        throw new Error(`Registration failed: ${response.status}`);
      }

      const result = await response.json();

      // Store Aadhar number after successful registration
      await storeAadharNumber(extractedData.aadhar_number);

      Alert.alert('Registration Successful', 'You have been successfully registered as a voter!', [
        {
          text: 'Continue to Dashboard',
          onPress: () => router.replace({
            pathname: '/dashboard',
            params: {
              extractedPhone: String(extractedData.phone ?? ''),
              extractedAadhar: String(extractedData.aadhar_number ?? ''),
              voterRegistered: 'true'
            }
          }),
        },
      ]);

    } catch (error) {
      console.error('Voter registration error:', error);
      Alert.alert('Registration Failed', 'Failed to register voter. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const checkAadharRegistration = async (aadharNumber: string) => {
    try {
      const response = await fetch(
        `https://notional-yeti-461501-r9.uc.r.appspot.com/api/voters/status/aadhar/${aadharNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result; // Return the registration status data
      } else if (response.status === 404) {
        return null; // Not registered
      } else {
        throw new Error(`Status check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error checking Aadhar registration:', error);
      throw error;
    }
  };

  const storeAadharNumber = async (aadharNumber: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { error } = await supabase.auth.updateUser({
          data: { aadhar_number: aadharNumber }
        });

        if (error) {
          console.error('Error storing Aadhar number:', error);
        }
      }
    } catch (error) {
      console.error('Error storing Aadhar number:', error);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please upload your Aadhar image first');
      return;
    }

    if (!GEMINI_API_KEY) {
      Alert.alert('Error', 'Missing Gemini API key');
      return;
    }

    setUploading(true);

    try {
      const data = await extractAadharData(image);
      setExtractedData(data);
      await saveDataToFile(data);

      // Check if this Aadhar number is already registered
      if (data.aadhar_number && data.aadhar_number !== 'Not visible') {
        try {
          const registrationStatus = await checkAadharRegistration(data.aadhar_number);

          if (registrationStatus) {
            // User is already registered
            Alert.alert(
              'Already Registered',
              'This Aadhar number is already registered as a voter. Redirecting to dashboard.',
              [
                {
                  text: 'Go to Dashboard',
                  onPress: () => {
                    // Store the Aadhar number for future use
                    storeAadharNumber(data.aadhar_number);
                    router.replace({
                      pathname: '/dashboard',
                      params: {
                        extractedPhone: String(data.phone ?? ''),
                        extractedAadhar: String(data.aadhar_number ?? ''),
                        voterRegistered: 'true',
                        alreadyRegistered: 'true'
                      }
                    });
                  }
                }
              ]
            );
            return;
          }
        } catch (error) {
          console.log('Registration check failed, proceeding with new registration');
        }
      }

    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to process Aadhar card. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/dashboard')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voter Verification</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Upload Aadhar Card</Text>
        <Text style={styles.subtitle}>Please upload a clear image of your Aadhar card for verification</Text>

        <TouchableOpacity style={styles.uploadContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>Tap to upload</Text>
            </View>
          )}
        </TouchableOpacity>

        {extractedData && (
          <View style={styles.dataPreview}>
            <Text style={styles.dataPreviewTitle}>Extracted Data:</Text>
            <Text style={styles.dataPreviewText}>Name: {extractedData.name || 'N/A'}</Text>
            <Text style={styles.dataPreviewText}>Aadhar Number: {extractedData.aadhar_number || 'N/A'}</Text>
            <Text style={styles.dataPreviewText}>Date of Birth: {extractedData.date_of_birth || 'N/A'}</Text>
            <Text style={styles.dataPreviewText}>Gender: {extractedData.gender || 'N/A'}</Text>
            <Text style={styles.dataPreviewText}>Father's Name: {extractedData.father_name || 'N/A'}</Text>
            <Text style={styles.dataPreviewText}>Phone: {extractedData.phone || 'N/A'}</Text>
            <Text style={styles.dataPreviewText}>Address: {extractedData.address || 'N/A'}</Text>

            {/* Phone Verification Status */}
            <View style={[styles.verificationStatus, phoneVerified ? styles.verified : styles.unverified]}>
              <Text style={styles.verificationStatusText}>
                {phoneVerified ? '✓ Phone Verified' : '❌ Phone Not Verified'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewDataButton}
              onPress={() => Alert.alert('Raw JSON Data', JSON.stringify(extractedData, null, 2))}
            >
              <Text style={styles.viewDataButtonText}>View Raw JSON</Text>
            </TouchableOpacity>
          </View>
        )}

        {showRegistrationForm && extractedData && phoneVerified && (
          <View style={styles.registrationForm}>
            <Text style={styles.formTitle}>Complete Voter Registration</Text>
            <Text style={styles.formSubtitle}>Please provide the following additional information:</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                value={registrationData.email}
                onChangeText={(text) => setRegistrationData({ ...registrationData, email: text })}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.textInput}
                value={registrationData.city}
                onChangeText={(text) => setRegistrationData({ ...registrationData, city: text })}
                placeholder="Enter your city"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>State *</Text>
              <TextInput
                style={styles.textInput}
                value={registrationData.state}
                onChangeText={(text) => setRegistrationData({ ...registrationData, state: text })}
                placeholder="Enter your state"
              />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, registering && styles.disabledButton]}
              onPress={registerVoter}
              disabled={registering}
            >
              <Text style={styles.registerButtonText}>
                {registering ? 'Registering...' : 'Register as Voter'}
              </Text>
            </TouchableOpacity>

            {registering && <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 10 }} />}
          </View>
        )}

        {showRegistrationForm && extractedData && !phoneVerified && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              ❌ Phone number verification failed. Please ensure your Aadhar card contains the same phone number you used to log in.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={resetForm}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!showRegistrationForm && (
          <TouchableOpacity
            style={[styles.submitButton, (!image || uploading) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!image || uploading}
          >
            <Text style={styles.submitButtonText}>
              {uploading ? 'Processing with AI...' : 'Extract Data & Continue'}
            </Text>
          </TouchableOpacity>
        )}

        {uploading && <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 10 }} />}

        <Text style={styles.noteText}>
          Note: Upload clear image for accurate data extraction using AI
        </Text>
      </View>
    </ScrollView>
  );
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
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  uploadContainer: {
    width: '100%',
    height: 250,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 10,
    color: '#9ca3af',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dataPreview: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dataPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  dataPreviewText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
  viewDataButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  viewDataButtonText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  registrationForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  registerButton: {
    backgroundColor: '#10b981',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationStatus: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  verified: {
    backgroundColor: '#dcfce7',
  },
  unverified: {
    backgroundColor: '#fef2f2',
  },
  verificationStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});