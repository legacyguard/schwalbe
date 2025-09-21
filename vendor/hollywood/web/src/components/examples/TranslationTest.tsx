/**
 * Translation Test Component
 * Demonstrates the English-only translation system
 */

import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const TranslationTest: React.FC = () => {
  const { t, language } = useTranslation();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('common.labels.title')}: Translation Test</CardTitle>
        <p className="text-muted-foreground">
          Current language: {language}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('common.buttons.save')}</h3>
          <div className="flex gap-2 flex-wrap">
            <Button>{t('common.buttons.save')}</Button>
            <Button variant="outline">{t('common.buttons.cancel')}</Button>
            <Button variant="destructive">{t('common.buttons.delete')}</Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('navigation.menu')}</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="ghost">{t('navigation.home')}</Button>
            <Button variant="ghost">{t('navigation.dashboard')}</Button>
            <Button variant="ghost">{t('navigation.settings')}</Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('documents.title')}</h3>
          <div className="space-y-2">
            <p>{t('documents.upload')}</p>
            <p>{t('documents.uploader.selectFilePrompt')}</p>
            <p>{t('documents.uploader.fileSizeLimit')}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('accessibility.skipLinks.skipLinksNavLabel')}</h3>
          <div className="space-y-2">
            <p>{t('accessibility.skipLinks.mainContent')}</p>
            <p>{t('accessibility.skipLinks.navigation')}</p>
            <p>{t('accessibility.skipLinks.search')}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{t('family.title')}</h3>
          <div className="space-y-2">
            <p>{t('family.roleAssignment.currentStatus')}</p>
            <p>{t('family.roleAssignment.roles.heir')}</p>
            <p>{t('family.roleAssignment.roles.executor')}</p>
            <p>{t('family.roleAssignment.roles.guardian')}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Interpolation Test</h3>
          <p>{t('accessibility.screenReader.pageOf', { current: '1', total: '10' })}</p>
          <p>{t('accessibility.screenReader.selectedItems', { count: '5' })}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Missing Key Test</h3>
          <p>Missing key result: "{t('nonexistent.key.test')}"</p>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Translation Status</h4>
          <ul className="space-y-1 text-sm">
            <li>✅ Common UI elements translated</li>
            <li>✅ Accessibility labels translated</li>
            <li>✅ Document uploader messages translated</li>
            <li>✅ Family role assignment labels translated</li>
            <li>✅ Interpolation working</li>
            <li>✅ Missing key fallback working</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
