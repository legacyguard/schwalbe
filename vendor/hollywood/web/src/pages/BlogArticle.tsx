
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetaTags } from '@/components/common/MetaTags';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon-library';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';
import { Link, useNavigate, useParams } from 'react-router-dom';

const BlogArticle = () => {
  const { t } = useTranslation('ui/blog-article');
  const { slug } = useParams();
  const navigate = useNavigate();

  // For now, we'll hardcode the article data, but this could be fetched from an API
  const article = {
    title: '5 Reasons to Create Your Will Today',
    excerpt:
      'Discover why creating a will is one of the most important acts of care for your family, and how to approach this crucial decision with clarity and confidence.',
    featureImage: 'https://legacyguard.app/blog/will-creation-guide.png',
    url: `https://legacyguard.app/blog/${slug}`,
    author: 'LegacyGuard Legal Team',
    publishDate: 'January 2025',
    readTime: '8 min read',
  };

  // If slug doesn't match our known article, redirect to blog listing
  React.useEffect(() => {
    if (slug !== '5-reasons-create-will') {
      navigate('/blog');
    }
  }, [slug, navigate]);

  return (
    <>
      <MetaTags
        title={article.title}
        description={article.excerpt}
        imageUrl={article.featureImage}
        url={article.url}
        keywords={t('meta.keywords')}
      />

      <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
        {/* Header */}
        <header className='sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <Link
                to='/'
                className='flex items-center gap-3 hover:opacity-80 transition-opacity'
              >
                <LegacyGuardLogo />
                <span className='text-2xl font-bold text-slate-900 dark:text-white font-heading'>
                  LegacyGuard
                </span>
              </Link>
              <Link to='/'>
                <Button
                  variant='ghost'
                  className='text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                >
                  {t('header.backToHome')}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <main className='container mx-auto px-4 py-12 max-w-4xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='space-y-8'
          >
            {/* Article Header */}
            <div className='text-center space-y-4'>
              <Badge variant='outline' className='text-sm'>
                {t('badge.category')}
              </Badge>
              <h1 className='text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight'>
                {article.title}
              </h1>
              <p className='text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed'>
                {article.excerpt}
              </p>

              {/* Article Meta */}
              <div className='flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400'>
                <span>{t('byline.by')} {article.author}</span>
                <span>•</span>
                <span>{article.publishDate}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
            </div>

            {/* Introduction */}
            <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'>
              <CardContent className='p-6'>
                <div className='flex items-start gap-4'>
                  <Icon
                    name='lightbulb'
                    className='h-6 w-6 text-blue-600 mt-1 flex-shrink-0'
                  />
                  <div>
                    <h3 className='font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                      {t('intro.whyThisMatters.title')}
                    </h3>
                    <p className='text-blue-800 dark:text-blue-200 leading-relaxed'>
                      {t('intro.whyThisMatters.text')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className='prose prose-slate dark:prose-invert max-w-none space-y-8'>
              {/* Reason 1 */}
              <section>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-white mb-4'>
                  {t('reason1.title')}
                </h2>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason1.p1')}
                </p>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason1.p2')}
                </p>

                <Card className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 my-6'>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <Icon
                        name='alert-triangle'
                        className='h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0'
                      />
                      <div>
                        <h4 className='font-semibold text-amber-900 dark:text-amber-100 mb-1'>
                          {t('reason1.example.title')}
                        </h4>
                        <p className='text-amber-800 dark:text-amber-200 text-sm'>
                          {t('reason1.example.text')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Reason 2 */}
              <section>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-white mb-4'>
                  {t('reason2.title')}
                </h2>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason2.p1')}
                </p>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason2.p2')}
                </p>

                <div className='grid md:grid-cols-2 gap-4 my-6'>
                  <Card className='bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'>
                    <CardContent className='p-4'>
                      <h4 className='font-semibold text-green-900 dark:text-green-100 mb-2'>
                        {t('reason2.guardianSelection.title')}
                      </h4>
                      <ul className='text-green-800 dark:text-green-200 text-sm space-y-1'>
                        {t('reason2.guardianSelection.bullets', { returnObjects: true }).map((item: string) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className='bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'>
                    <CardContent className='p-4'>
                      <h4 className='font-semibold text-green-900 dark:text-green-100 mb-2'>
                        {t('reason2.trustBenefits.title')}
                      </h4>
                      <ul className='text-green-800 dark:text-green-200 text-sm space-y-1'>
                        {t('reason2.trustBenefits.bullets', { returnObjects: true }).map((item: string) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Reason 3 */}
              <section>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-white mb-4'>
                  {t('reason3.title')}
                </h2>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason3.p1')}
                </p>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason3.p2')}
                </p>

                <Card className='bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 my-6'>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <Icon
                        name='heart'
                        className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0'
                      />
                      <div>
                        <h4 className='font-semibold text-red-900 dark:text-red-100 mb-1'>
                          {t('reason3.card.title')}
                        </h4>
                        <p className='text-red-800 dark:text-red-200 text-sm'>
                          {t('reason3.card.text')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Reason 4 */}
              <section>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-white mb-4'>
                  {t('reason4.title')}
                </h2>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason4.p1')}
                </p>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason4.p2')}
                </p>

                <div className='bg-slate-100 dark:bg-slate-800 rounded-lg p-6 my-6'>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-4 text-center'>
                    {t('reason4.costComparison.title')}
                  </h4>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-red-600 mb-2'>
                        {t('reason4.costComparison.withoutWill')}
                      </div>
                      <div className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
                        $15,000+
                      </div>
                      <div className='text-sm text-slate-600 dark:text-slate-400'>
                        {t('reason4.costComparison.feesCourt')}
                      </div>
                      <div className='text-sm text-slate-600 dark:text-slate-400'>
                        {t('reason4.costComparison.monthsLong')}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600 mb-2'>
                        {t('reason4.costComparison.withWill')}
                      </div>
                      <div className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
                        $2,000-5,000
                      </div>
                      <div className='text-sm text-slate-600 dark:text-slate-400'>
                        {t('reason4.costComparison.feesOnly')}
                      </div>
                      <div className='text-sm text-slate-600 dark:text-slate-400'>
                        {t('reason4.costComparison.monthsShort')}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Reason 5 */}
              <section>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-white mb-4'>
                  {t('reason5.title')}
                </h2>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason5.p1')}
                </p>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>
                  {t('reason5.p2')}
                </p>

                <Card className='bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 my-6'>
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <Icon
                        name='star'
                        className='h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0'
                      />
                      <div>
                        <h4 className='font-semibold text-purple-900 dark:text-purple-100 mb-1'>
                          {t('reason5.card.title')}
                        </h4>
                        <p className='text-purple-800 dark:text-purple-200 text-sm'>
                          {t('reason5.card.text')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* How LegacyGuard Helps */}
              <section className='bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-lg p-8 border border-slate-200 dark:border-slate-700'>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center'>
                  {t('howHelps.title')}
                </h2>

                <div className='grid md:grid-cols-2 gap-6 mb-6'>
                  <Card className='bg-white dark:bg-slate-800 shadow-lg'>
                    <CardContent className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div className='bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg'>
                          <Icon
                            name='shield'
                            className='h-6 w-6 text-blue-600'
                          />
                        </div>
                        <div>
                          <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
                            {t('howHelps.cards.storage.title')}
                          </h3>
                          <p className='text-slate-600 dark:text-slate-300 text-sm'>
                            {t('howHelps.cards.storage.text')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='bg-white dark:bg-slate-800 shadow-lg'>
                    <CardContent className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div className='bg-green-100 dark:bg-green-900/30 p-3 rounded-lg'>
                          <Icon
                            name='users'
                            className='h-6 w-6 text-green-600'
                          />
                        </div>
                        <div>
                          <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
                            {t('howHelps.cards.family.title')}
                          </h3>
                          <p className='text-slate-600 dark:text-slate-300 text-sm'>
                            {t('howHelps.cards.family.text')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='bg-white dark:bg-slate-800 shadow-lg'>
                    <CardContent className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div className='bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg'>
                          <Icon
                            name='calendar'
                            className='h-6 w-6 text-purple-600'
                          />
                        </div>
                        <div>
                          <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
                            {t('howHelps.cards.reminders.title')}
                          </h3>
                          <p className='text-slate-600 dark:text-slate-300 text-sm'>
                            {t('howHelps.cards.reminders.text')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='bg-white dark:bg-slate-800 shadow-lg'>
                    <CardContent className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div className='bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg'>
                          <Icon
                            name='file-text'
                            className='h-6 w-6 text-amber-600'
                          />
                        </div>
                        <div>
                          <h3 className='font-semibold text-slate-900 dark:text-white mb-2'>
                            {t('howHelps.cards.organization.title')}
                          </h3>
                          <p className='text-slate-600 dark:text-slate-300 text-sm'>
                            {t('howHelps.cards.organization.text')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className='text-center'>
                  <p className='text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto'>
                    {t('howHelps.footer.text')}
                  </p>
                  <Link to='/sign-up'>
                    <Button
                      size='lg'
                      className='bg-blue-600 hover:bg-blue-700 text-white'
                    >
                      {t('howHelps.footer.cta')}
                    </Button>
                  </Link>
                </div>
              </section>

              {/* Next Steps */}
              <section>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-white mb-4'>
                  {t('nextSteps.title')}
                </h2>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-6'>
                  {t('nextSteps.intro')}
                </p>

                <div className='space-y-4'>
                  <div className='flex items-start gap-4'>
                    <div className='bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0'>
                      1
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 dark:text-white mb-1'>
                        {t('nextSteps.steps.gather.title')}
                      </h4>
                      <p className='text-slate-600 dark:text-slate-400 text-sm'>
                        {t('nextSteps.steps.gather.text')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0'>
                      2
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 dark:text-white mb-1'>
                        {t('nextSteps.steps.beneficiaries.title')}
                      </h4>
                      <p className='text-slate-600 dark:text-slate-400 text-sm'>
                        {t('nextSteps.steps.beneficiaries.text')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0'>
                      3
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 dark:text-white mb-1'>
                        {t('nextSteps.steps.guardians.title')}
                      </h4>
                      <p className='text-slate-600 dark:text-slate-400 text-sm'>
                        {t('nextSteps.steps.guardians.text')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0'>
                      4
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 dark:text-white mb-1'>
                        {t('nextSteps.steps.consult.title')}
                      </h4>
                      <p className='text-slate-600 dark:text-slate-400 text-sm'>
                        {t('nextSteps.steps.consult.text')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <div className='bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0'>
                      5
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-900 dark:text-white mb-1'>
                        {t('nextSteps.steps.store.title')}
                      </h4>
                      <p className='text-slate-600 dark:text-slate-400 text-sm'>
                        {t('nextSteps.steps.store.text')}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Conclusion */}
              <section className='bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900/20 rounded-lg p-8 border border-slate-200 dark:border-slate-700'>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-white mb-4 text-center'>
                  {t('conclusion.title')}
                </h2>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-center max-w-3xl mx-auto'>
                  {t('conclusion.p1')}
                </p>
                <p className='text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-center max-w-3xl mx-auto'>
                  {t('conclusion.p2')}
                </p>

                <div className='text-center'>
                  <Link to='/sign-up'>
                    <Button
                      size='lg'
                      className='bg-slate-900 hover:bg-slate-800 text-white mr-4'
                    >
                      {t('conclusion.primary')}
                    </Button>
                  </Link>
                  <Link to='/'>
                    <Button variant='outline' size='lg'>
                      {t('conclusion.secondary')}
                    </Button>
                  </Link>
                </div>
              </section>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default BlogArticle;
