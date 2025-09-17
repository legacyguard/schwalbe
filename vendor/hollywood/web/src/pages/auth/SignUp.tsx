
import { SignUp } from '@clerk/clerk-react';
import { FadeIn } from '@/components/motion/FadeIn';

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <FadeIn duration={0.5} delay={0.2}>
        <div className='w-full max-w-md'>
          <SignUp
            path='/sign-up'
            routing='path'
            signInUrl='/sign-in'
            afterSignUpUrl='/'
          />
        </div>
      </FadeIn>
    </div>
  );
}
