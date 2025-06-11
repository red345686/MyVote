import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image, Platform, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const GEMINI_API_KEY = 'AIzaSyC_8gpenp5BkrUeVyAVrrbt02K7sM6ipaI';

export default function Verification() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const convertImageToBase64 = async (uri: string) => {
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
    throw error;
  }
};


  const extractAadharData = async (imageUri: string) => {
    const base64Image = await convertImageToBase64(imageUri);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this Aadhar card image and extract the following info as JSON...` // full prompt
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

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);

    throw new Error('No valid JSON found in response');
  };

  const saveDataToFile = async (data: any) => {
    const fileName = `aadhar_data_${Date.now()}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
    return fileUri;
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

      Alert.alert('Verification Successful', 'Aadhar data extracted!', [
        {
          text: 'View Data',
          onPress: () => Alert.alert('Extracted Data', JSON.stringify(data, null, 2)),
        },
        {
          text: 'Continue',
          onPress: () => router.replace('/dashboard'),
        },
      ]);
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to process Aadhar card. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
            <Text style={styles.dataPreviewTitle}>Extracted Data Preview:</Text>
            <Text style={styles.dataPreviewText}>Name: {extractedData.name || 'N/A'}</Text>
            <Text style={styles.dataPreviewText}>Aadhar: {extractedData.aadhar_number || 'N/A'}</Text>
            <Text style={styles.dataPreviewText}>DOB: {extractedData.date_of_birth || 'N/A'}</Text>
            <TouchableOpacity
              style={styles.viewDataButton}
              onPress={() => Alert.alert('Full Data', JSON.stringify(extractedData, null, 2))}
            >
              <Text style={styles.viewDataButtonText}>View Full Data</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, (!image || uploading) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={!image || uploading}
        >
          <Text style={styles.submitButtonText}>
            {uploading ? 'Processing with AI...' : 'Submit for Verification'}
          </Text>
        </TouchableOpacity>

        {uploading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}

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
})