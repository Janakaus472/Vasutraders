import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { getFirebaseAuth } from './config'
import { ensureUserDocument } from './firestore'

let recaptchaVerifier: RecaptchaVerifier | null = null

export function initRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
    recaptchaVerifier = null
  }
  recaptchaVerifier = new RecaptchaVerifier(getFirebaseAuth(), containerId, {
    size: 'invisible',
  })
  return recaptchaVerifier
}

export function clearRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
    recaptchaVerifier = null
  }
}

export async function sendOtp(
  phoneNumber: string,
  containerId: string
): Promise<ConfirmationResult> {
  const verifier = initRecaptcha(containerId)
  return signInWithPhoneNumber(getFirebaseAuth(), phoneNumber, verifier)
}

export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<UserCredential> {
  const credential = await confirmationResult.confirm(otp)
  await ensureUserDocument(credential.user)
  return credential
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth())
}
