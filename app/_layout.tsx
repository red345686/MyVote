import { Session } from '@supabase/supabase-js'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <LanguageProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="verification" options={{ headerShown: false }} />
        <Stack.Screen name="qrcode" options={{ headerShown: false }} />
        <Stack.Screen name="upcomingelections" options={{ headerShown: false }} />
        <Stack.Screen name="faq" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ headerShown: false }} />
      </Stack>
    </LanguageProvider>
  )
}

// All screens are included in the stack. Session is managed globally for phone comparison in dashboard.