import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FadeIn } from '@/components/motion/FadeIn';
import { uploadDocumentAndAnalyze, type AnalysisResult } from '@/features/documents/api/documentApi';

interface IDScanProps {
  onBack: () => void;
  onNext: () => void;
}

export default function IDScan({ onBack, onNext }: IDScanProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const { analysis } = await uploadDocumentAndAnalyze(file);
      setAnalysis(analysis ?? null);
    } catch (e) {
      setError('Document analysis failed. You can skip this step and add your ID later.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <FadeIn duration={0.8}>
        <Card className="w-full max-w-3xl border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Verify Your Identity (Optional Quick Win)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Upload a photo of your ID card or passport. We will extract your name and birth date to get you started. You can skip this and add it later.
            </p>

            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                aria-label="Upload ID document"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={onBack} aria-label="Go back">
                  Back
                </Button>
                <Button onClick={handleUpload} disabled={!file || isUploading} aria-label="Analyze document">
                  {isUploading ? 'Analyzing…' : 'Analyze'}
                </Button>
                <Button variant="secondary" onClick={onNext} aria-label="Skip step">
                  Skip
                </Button>
              </div>
              {error && <div className="text-sm text-red-400" role="alert">{error}</div>}

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border border-primary/20 rounded-lg p-4"
                >
                  <h3 className="font-medium mb-2">AI Analysis Result</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Suggested category: {analysis.suggestedCategory?.category ?? 'Unknown'}</li>
                    <li>Suggested title: {analysis.suggestedTitle?.title ?? 'Untitled'}</li>
                    <li>Confidence: {Math.round((analysis.confidence ?? 0) * 100)}%</li>
                  </ul>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={onNext} aria-label="Continue to next step">Continue</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}