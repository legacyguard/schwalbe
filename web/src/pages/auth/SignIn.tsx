
import { SignIn } from '@clerk/clerk-react';
import { FadeIn } from '@/components/motion/FadeIn';

export default function SignInPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <FadeIn duration={0.5} delay={0.2}>
        <div className='w-full max-w-md'>
          <SignIn
            path='/sign-in'
            routing='path'
            signUpUrl='/sign-up'
            afterSignInUrl='/'
          />
        </div>
      </FadeIn>
    </div>
  );
}
