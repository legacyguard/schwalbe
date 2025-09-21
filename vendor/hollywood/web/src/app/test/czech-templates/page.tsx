import { CZTemplateLoaderTest } from '@/components/examples/CZTemplateLoaderTest';

export default function CzechTemplatesTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Czech Will Template System Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This page tests the Czech will template loading system, validating that all three
            will types (holographic with mandatory dating, witnessed with 2 witnesses, and notarial)
            can be loaded successfully from the template library with proper Czech Civil Code compliance.
          </p>
        </div>

        <CZTemplateLoaderTest />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🚀 Czech will template system test - Verifying will-cz implementation</p>
          <p>Legal compliance: Czech Civil Code § 1540-1542</p>
        </div>
      </div>
    </div>
  );
}
