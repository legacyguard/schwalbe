import React, { useState } from 'react';
import { LegalValidator } from '@/lib/will-legal-validator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Showcase component demonstrating Slovak jurisdiction witness validation
 * This component validates the requirement of 2 witnesses for witnessed wills in Slovakia
 */
export const SKWitnessValidationShowcase: React.FC = () => {
  const [selectedWillType, setSelectedWillType] = useState<string>('holographic');
  const [witnessCount, setWitnessCount] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<any>(null);

  const validator = new LegalValidator('Slovakia');

  const handleValidation = () => {
    // Create witness array based on count
    const witnesses = Array.from({ length: witnessCount }, (_, i) => ({
      name: `Witness ${i + 1}`,
      age: 30 + i,
    }));

    // Validate witness requirements
    const result = validator.validateWitnessRequirements(
      selectedWillType,
      witnesses.length > 0 ? witnesses : undefined
    );

    setValidationResult(result);
  };

  const getValidationIcon = () => {
    if (!validationResult) return null;

    switch (validationResult.level) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getValidationColor = () => {
    if (!validationResult) return 'bg-gray-50';

    switch (validationResult.level) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          Slovak Jurisdiction Witness Validation
        </h2>
        <p className="text-gray-600 mb-6">
          Testing the witness requirements for different will types in Slovakia.
          According to Slovak law, witnessed wills require exactly 2 witnesses.
        </p>

        <div className="space-y-4">
          {/* Will Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Will Type
            </label>
            <select
              value={selectedWillType}
              onChange={(e) => setSelectedWillType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="holographic">
                Holographic (Vlastnoručný závet) - No witnesses required
              </option>
              <option value="witnessed">
                Witnessed (Závet pred svedkami) - 2 witnesses required
              </option>
              <option value="notarial">
                Notarial (Notársky závet) - No witnesses required
              </option>
            </select>
          </div>

          {/* Witness Count Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Witnesses
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={witnessCount}
              onChange={(e) => setWitnessCount(parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Validate Button */}
          <Button onClick={handleValidation} className="w-full">
            Validate Witness Requirements
          </Button>

          {/* Validation Result */}
          {validationResult && (
            <Alert className={getValidationColor()}>
              <div className="flex items-start gap-3">
                {getValidationIcon()}
                <AlertDescription>
                  <div className="font-medium mb-1">
                    {validationResult.isValid ? 'Valid' : 'Invalid'}
                  </div>
                  <div>{validationResult.message}</div>
                  {validationResult.autoSuggestion && (
                    <div className="mt-2 text-sm italic">
                      Suggestion: {validationResult.autoSuggestion}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </Card>

      {/* Legal Information */}
      <Card className="p-6 bg-blue-50">
        <h3 className="text-lg font-semibold mb-3">
          Slovak Legal Requirements
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Holographic Will (§ 476 Civil Code):</strong> Must be
            entirely handwritten and signed by the testator. No witnesses
            required.
          </p>
          <p>
            <strong>Witnessed Will (§ 477 Civil Code):</strong> Can be typed or
            written by another person. Requires exactly 2 witnesses who must be
            present simultaneously and cannot be beneficiaries.
          </p>
          <p>
            <strong>Notarial Will:</strong> Created before a notary. No
            additional witnesses required as the notary serves as the official
            witness.
          </p>
        </div>
      </Card>

      {/* Test Scenarios */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Test Scenarios</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWillType('witnessed');
              setWitnessCount(0);
              setTimeout(handleValidation, 100);
            }}
            className="w-full justify-start"
          >
            Test: Witnessed will with 0 witnesses (Should fail)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWillType('witnessed');
              setWitnessCount(1);
              setTimeout(handleValidation, 100);
            }}
            className="w-full justify-start"
          >
            Test: Witnessed will with 1 witness (Should fail)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWillType('witnessed');
              setWitnessCount(2);
              setTimeout(handleValidation, 100);
            }}
            className="w-full justify-start"
          >
            Test: Witnessed will with 2 witnesses (Should pass)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWillType('witnessed');
              setWitnessCount(3);
              setTimeout(handleValidation, 100);
            }}
            className="w-full justify-start"
          >
            Test: Witnessed will with 3 witnesses (Should warn)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedWillType('holographic');
              setWitnessCount(0);
              setTimeout(handleValidation, 100);
            }}
            className="w-full justify-start"
          >
            Test: Holographic will with 0 witnesses (Should pass)
          </Button>
        </div>
      </Card>
    </div>
  );
};
