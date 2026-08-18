import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { LoginBento } from '@/components/login/login-bento'
import { Button } from '@/components/ui/button'
import { fontStyleForWeight } from '@/constants/fonts'
import palette from '@/constants/palette'
import { Radius } from '@/constants/theme'
import { useSendOtpMutation } from '@/queries/use-auth'
import { getAppVersionLabel } from '@/utils/app-version'

const PHONE_ACCESSORY_ID = 'login-phone-accessory'

function digitsFromParam(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value
  return (raw ?? '').replace(/\D/g, '').slice(-10)
}

export function LoginScreen () {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const inputRef = useRef<TextInput>(null)
  const { mobile: mobileParam } = useLocalSearchParams<{ mobile?: string | string[] }>()

  const [phone, setPhone] = useState(() => digitsFromParam(mobileParam))
  const [error, setError] = useState('')
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const sendOtp = useSendOtpMutation()

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        return router.canGoBack()
      })
      return () => subscription.remove()
    }, [router])
  )

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true)
    )
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false)
    )
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  async function onLogin () {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setError('')
    try {
      await sendOtp.mutateAsync(digits)
      Keyboard.dismiss()
      router.push({ pathname: '/otp', params: { mobile: digits } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <View
          style={[
            styles.bentoArea,
            keyboardVisible ? styles.bentoAreaCompact : null
          ]}
          pointerEvents='box-none'
        >
          <LoginBento compact={keyboardVisible} />
        </View>

        <View
          style={[
            styles.sheet,
            keyboardVisible ? styles.sheetCompact : null,
            {
              paddingBottom: keyboardVisible
                ? 12
                : Math.max(insets.bottom, 16) + 8
            }
          ]}
        >
          <Text style={styles.title}>Get Started!</Text>
          <Text style={styles.label}>Please enter your phone number</Text>

          <Pressable
            style={[styles.inputBox, error ? styles.inputError : null]}
            onPress={() => inputRef.current?.focus()}
          >
            <TextInput
              ref={inputRef}
              value={phone}
              onChangeText={text => {
                setPhone(text.replace(/\D/g, '').slice(0, 10))
                if (error) setError('')
              }}
              placeholder='Mobile number'
              placeholderTextColor={palette.gray[400]}
              keyboardType='phone-pad'
              textContentType='telephoneNumber'
              autoComplete='tel'
              maxLength={10}
              returnKeyType='done'
              blurOnSubmit={false}
              onSubmitEditing={onLogin}
              inputAccessoryViewID={
                Platform.OS === 'ios' ? PHONE_ACCESSORY_ID : undefined
              }
              style={styles.input}
            />
            <Text pointerEvents='none' style={styles.prefix}>
              +91-
            </Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label='Login'
            onPress={onLogin}
            loading={sendOtp.isPending}
            style={styles.button}
          />

          <Text style={styles.terms}>
            <Text style={styles.termsMuted}>By continuing you agree to </Text>
            <Text style={styles.termsLink}>
              HelloWorld&apos;s Terms and conditions.
            </Text>
          </Text>

          {keyboardVisible ? null : (
            <Text style={styles.version}>{getAppVersionLabel()}</Text>
          )}
        </View>
      </KeyboardAvoidingView>
      {/* 
      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={PHONE_ACCESSORY_ID}>
          <View style={styles.accessory}>
            <Pressable onPress={Keyboard.dismiss} hitSlop={8}>
              <Text style={styles.accessoryDone}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null} */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.white
  },
  page: {
    flex: 1
  },
  bentoArea: {
    flex: 1,
    paddingTop: 8,
    minHeight: 0
  },
  bentoAreaCompact: {
    flex: 0,
    paddingTop: 8
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 12
  },
  sheetCompact: {
    paddingTop: 16,
    gap: 10
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    ...fontStyleForWeight('bold'),
    color: palette.black
  },
  label: {
    fontSize: 12,
    lineHeight: 18,
    ...fontStyleForWeight('medium'),
    color: palette.gray[600]
  },
  inputBox: {
    position: 'relative',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.gray[300],
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    backgroundColor: palette.white,
    height: 48
  },
  inputError: {
    borderColor: palette.red[400]
  },
  prefix: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    lineHeight: 48,
    ...fontStyleForWeight('regular'),
    color: palette.gray[400]
  },
  input: {
    width: '100%',
    paddingLeft: 46,
    paddingRight: 0,
    paddingVertical: 0,
    margin: 0,
    fontSize: 16,
    lineHeight: 20,
    height: 48,
    ...fontStyleForWeight('regular'),
    color: palette.black,
    ...(Platform.OS === 'android'
      ? { includeFontPadding: false, textAlignVertical: 'center' as const }
      : { paddingTop: 14, paddingBottom: 14 })
  },
  error: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.red[600],
    marginTop: -4
  },
  button: {
    width: '100%',
    marginTop: 4
  },
  terms: {
    textAlign: 'center',
    marginTop: 4
  },
  termsMuted: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.gray[700]
  },
  termsLink: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.blue[700]
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    ...fontStyleForWeight('regular'),
    color: palette.gray[500],
    marginTop: 4
  },
  accessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: palette.gray[100],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[300]
  },
  accessoryDone: {
    fontSize: 17,
    ...fontStyleForWeight('medium'),
    color: palette.blue[600]
  }
})
