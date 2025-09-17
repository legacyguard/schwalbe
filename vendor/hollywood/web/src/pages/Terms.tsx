
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';
import { useNavigate } from 'react-router-dom';

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950'>
      {/* Header */}
      <header className='sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-green-200/50 dark:border-green-800/50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <motion.div
              className='flex items-center gap-3 cursor-pointer'
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <LegacyGuardLogo />
              <span className='text-2xl font-bold text-green-900 dark:text-green-100 font-heading'>
                LegacyGuard
              </span>
            </motion.div>

            <Button
              variant='ghost'
              onClick={() => navigate('/')}
              className='text-green-700 hover:text-green-900'
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className='container mx-auto px-4 py-12 max-w-4xl'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className='text-4xl font-bold text-green-900 dark:text-green-100 mb-8 text-center'>
            Terms of Service
          </h1>

          <Card className='p-8 bg-white/80 dark:bg-slate-800/80'>
            <CardContent className='prose dark:prose-invert max-w-none'>
              <p className='text-lg text-green-700 dark:text-green-300 mb-6'>
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2>Agreement to Terms</h2>
              <p>
                By accessing and using LegacyGuard, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to abide by the above, please do not use this service.
              </p>

              <h2>Description of Service</h2>
              <p>
                LegacyGuard is a secure document management and legacy planning
                platform that helps users organize important documents, create
                wills, and plan for their family's future with the assistance of
                our AI guide, Sofia.
              </p>

              <h2>User Responsibilities</h2>
              <ul>
                <li>You must be at least 18 years old to use this service</li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account
                </li>
                <li>You agree to provide accurate and complete information</li>
                <li>
                  You will not use the service for any illegal or unauthorized
                  purpose
                </li>
                <li>
                  You are responsible for all content uploaded to your account
                </li>
              </ul>

              <h2>Privacy and Security</h2>
              <p>
                We take your privacy and security seriously. Your documents are
                encrypted end-to-end, and we cannot access your personal
                information. For detailed information about our privacy
                practices, please review our Privacy Policy.
              </p>

              <h2>Service Availability</h2>
              <p>
                While we strive to maintain 99.9% uptime, we cannot guarantee
                uninterrupted access to the service. We may perform maintenance
                that temporarily limits access.
              </p>

              <h2>Intellectual Property</h2>
              <p>
                The LegacyGuard service, including its software, design, and
                content, is protected by copyright and other intellectual
                property laws. You retain ownership of your uploaded content.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                LegacyGuard provides tools and guidance but is not a substitute
                for professional legal, financial, or medical advice. We
                recommend consulting with qualified professionals for your
                specific needs.
              </p>

              <h2>Termination</h2>
              <p>
                You may terminate your account at any time. We reserve the right
                to suspend or terminate accounts that violate these terms. Upon
                termination, your data will be securely deleted according to our
                data retention policy.
              </p>

              <h2>Changes to Terms</h2>
              <p>
                We may update these terms from time to time. We will notify
                users of significant changes via email or through the service
                interface.
              </p>

              <h2>Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at legal@legacyguard.com
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
