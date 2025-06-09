'use client'
import React from 'react'
import { GoogleAuthProvider, fetchSignInMethodsForEmail, getAuth, linkWithCredential, signInWithEmailAndPassword, signInWithPopup, EmailAuthProvider } from 'firebase/auth'
import { app, db } from '../../firebase'
import { GoogleIcon } from './Icons'
import useUserStore from '../../store/useUserStore'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface Props {
  setError: (value: string) => void
  onClose?: () => void
  isInModal?: boolean
  onLogin?: () => void
}

export default function SignInWithGoogle({ setError, onClose, isInModal, onLogin }: Props) {
  const { setUser, user } = useUserStore()
  const router = useRouter()

  const signInWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const userRef = doc(db, "users", googleUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        setUser({ ...userData, id: googleUser.uid });

        const credential = GoogleAuthProvider.credentialFromResult(result);
        const currentUser = auth.currentUser;
        if (isInModal) {
          onClose?.()
          onLogin?.()
        } else {
          router.back();
        }

        if (currentUser && credential) {
          await linkWithCredential(currentUser, credential);
        }
      } else {
        const data = await setDoc(userRef, {
          name: googleUser.displayName || '',
          email: googleUser.email,
          createdAt: new Date(),
          rol: 'customer',
          needPassword: true
        })
        const newUserSnap = await getDoc(userRef);
        const newUserData = newUserSnap.data() as User;
        setUser({ ...newUserData, id: googleUser.uid });
        if (isInModal) {
          onClose?.()
          onLogin?.()
        } else {
          router.back()
        }
        if (googleUser.email) {
          const credential = EmailAuthProvider.credential(googleUser.email, 'password1234password');
          await linkWithCredential(googleUser, credential);
          console.log("Cuenta vinculada con email y contraseña");
        }
      }
    } catch (error) {
      console.error("Error al autenticar con Google:", error);
    }
  };
  return (
    <>
      <p className='text-sm text-center'>o</p>
      <button onClick={signInWithGoogle} className='flex gap-2 border-2 w-full text-center justify-center items-center text-sm px-5 py-3 rounded-full hover:bg-gray-100 transition-colors'> <GoogleIcon className='w-4 h-4' /> Continuar con Google</button>
    </>
  )
}
