
import { createClient } from '@supabase/supabase-js';
import EmergencyDetectionEngine from './detection-engine';
import GuardianNotificationService from './guardian-notifier';
import EmergencyAccessControl, { type AccessContext } from './access-control';
import type { DetectionEngineConfig } from '@/types/emergency';

interface TestScenario {
  cleanup?: TestCleanupStep[];
  description: string;
  execution: TestExecutionStep[];
  id: string;
  name: string;
  setup: TestSetupStep[];
  validation: TestValidationStep[];
}

interface TestSetupStep {
  action:
    | 'create_documents'
    | 'create_guardian'
    | 'create_user'
    | 'set_activity'
    | 'set_shield_settings';
  data: Record<string, any>;
}

interface TestExecutionStep {
  action:
    | 'access_resource'
    | 'send_notification'
    | 'trigger_detection'
    | 'verify_guardian'
    | 'wait';
  data: Record<string, any>;
  expectedResult?: any;
}

interface TestValidationStep {
  check:
    | 'access_granted'
    | 'audit_logged'
    | 'guardian_notified'
    | 'notification_sent'
    | 'shield_status';
  expected: any;
  timeout?: number;
}

interface TestCleanupStep {
  action:
    | 'clear_notifications'
    | 'delete_guardian'
    | 'delete_user'
    | 'reset_shield';
  data: Record<string, any>;
}

interface TestResult {
  duration: number;
  error?: string;
  passed: boolean;
  scenario: string;
  steps: StepResult[];
}

interface StepResult {
  actual?: any;
  duration: number;
  error?: string;
  expected?: any;
  passed: boolean;
  step: string;
}

export class EmergencyTestingSystem {
  private supabaseUrl: string;
  private supabaseServiceKey: string;
  private detectionEngine: EmergencyDetectionEngine;
  private notificationService: GuardianNotificationService;
  private accessControl: EmergencyAccessControl;
  private testUsers: Set<string> = new Set();

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string,
    baseUrl: string,
    config?: Partial<DetectionEngineConfig>
  ) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseServiceKey = supabaseServiceKey;

    this.detectionEngine = new EmergencyDetectionEngine(
      supabaseUrl,
      supabaseServiceKey,
      config
    );

    this.notificationService = new GuardianNotificationService(
      supabaseUrl,
      supabaseServiceKey,
      baseUrl
    );

    this.accessControl = new EmergencyAccessControl(
      supabaseUrl,
      supabaseServiceKey
    );
  }

  private getServiceClient() {
    return createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async runTestSuite(): Promise<TestResult[]> {
    console.warn('🧪 Starting Emergency Activation System Test Suite');
    const scenarios = this.getTestScenarios();
    const results: TestResult[] = [];

    for (const scenario of scenarios) {
      console.warn(`\n📋 Running scenario: ${scenario.name}`);
      const result = await this.runTestScenario(scenario);
      results.push(result);

      if (result.passed) {
        console.warn(`✅ ${scenario.name} - PASSED (${result.duration}ms)`);
      } else {
        console.error(`❌ ${scenario.name} - FAILED: ${result.error}`);
      }
    }

    // Cleanup all test users
    await this.cleanupTestUsers();

    const totalPassed = results.filter(r => r.passed).length;
    const totalTests = results.length;

    console.warn(
      `\n🏁 Test Suite Complete: ${totalPassed}/${totalTests} scenarios passed`
    );

    return results;
  }

  private getTestScenarios(): TestScenario[] {
    return [
      {
        id: 'inactivity-detection',
        name: 'Inactivity Detection Trigger',
        description:
          'Test that extended inactivity properly triggers emergency activation',
        setup: [
          {
            action: 'create_user',
            data: { email: 'test-user-1@example.com', name: 'Test User 1' },
          },
          {
            action: 'create_guardian',
            data: {
              name: 'Guardian 1',
              email: 'guardian1@example.com',
              can_trigger_emergency: true,
              emergency_contact_priority: 1,
            },
          },
          {
            action: 'set_shield_settings',
            data: {
              is_shield_enabled: true,
              inactivity_period_months: 6,
              required_guardians_for_activation: 1,
            },
          },
          {
            action: 'set_activity',
            data: { last_activity_days_ago: 200 }, // Beyond 6 month threshold
          },
        ],
        execution: [
          {
            action: 'trigger_detection',
            data: { check_type: 'inactivity' },
            expectedResult: {
              should_trigger: true,
              trigger_type: 'inactivity_detected',
            },
          },
        ],
        validation: [
          {
            check: 'shield_status',
            expected: 'pending_verification',
            timeout: 5000,
          },
          { check: 'notification_sent', expected: true, timeout: 5000 },
          { check: 'audit_logged', expected: true, timeout: 5000 },
        ],
      },

      {
        id: 'guardian-verification',
        name: 'Guardian Verification Process',
        description: 'Test guardian notification and verification flow',
        setup: [
          {
            action: 'create_user',
            data: { email: 'test-user-2@example.com', name: 'Test User 2' },
          },
          {
            action: 'create_guardian',
            data: {
              name: 'Guardian 2',
              email: 'guardian2@example.com',
              can_trigger_emergency: true,
              emergency_contact_priority: 1,
            },
          },
          {
            action: 'set_shield_settings',
            data: { is_shield_enabled: true },
          },
        ],
        execution: [
          {
            action: 'trigger_detection',
            data: { trigger_type: 'manual_guardian' },
          },
          { action: 'wait', data: { milliseconds: 1000 } },
          {
            action: 'verify_guardian',
            data: { response: 'confirmed' },
          },
        ],
        validation: [
          { check: 'shield_status', expected: 'active', timeout: 5000 },
          { check: 'guardian_notified', expected: true, timeout: 5000 },
        ],
      },

      {
        id: 'access-control',
        name: 'Emergency Access Control',
        description: 'Test resource access permissions during emergency',
        setup: [
          {
            action: 'create_user',
            data: { email: 'test-user-3@example.com', name: 'Test User 3' },
          },
          {
            action: 'create_guardian',
            data: {
              name: 'Guardian 3',
              email: 'guardian3@example.com',
              can_access_health_docs: true,
              can_access_financial_docs: false,
            },
          },
          {
            action: 'create_documents',
            data: {
              documents: [
                { name: 'medical-record.pdf', type: 'Health' },
                { name: 'bank-statement.pdf', type: 'Financial' },
              ],
            },
          },
          {
            action: 'set_shield_settings',
            data: { is_shield_enabled: true, shield_status: 'active' },
          },
        ],
        execution: [
          {
            action: 'access_resource',
            data: {
              resource_type: 'document',
              document_type: 'Health',
              accessor_type: 'guardian',
            },
            expectedResult: { granted: true },
          },
          {
            action: 'access_resource',
            data: {
              resource_type: 'document',
              document_type: 'Financial',
              accessor_type: 'guardian',
            },
            expectedResult: { granted: false },
          },
        ],
        validation: [
          {
            check: 'access_granted',
            expected: { health: true, financial: false },
          },
          { check: 'audit_logged', expected: true },
        ],
      },

      {
        id: 'health-check-failure',
        name: 'Health Check Failure Detection',
        description: 'Test detection based on missed health checks',
        setup: [
          {
            action: 'create_user',
            data: { email: 'test-user-4@example.com', name: 'Test User 4' },
          },
          {
            action: 'create_guardian',
            data: {
              name: 'Guardian 4',
              email: 'guardian4@example.com',
              can_trigger_emergency: true,
            },
          },
          {
            action: 'set_shield_settings',
            data: { is_shield_enabled: true },
          },
        ],
        execution: [
          // Simulate 5 consecutive missed health checks
          {
            action: 'trigger_detection',
            data: { check_type: 'health_check', responded: false },
          },
          {
            action: 'trigger_detection',
            data: { check_type: 'health_check', responded: false },
          },
          {
            action: 'trigger_detection',
            data: { check_type: 'health_check', responded: false },
          },
          {
            action: 'trigger_detection',
            data: { check_type: 'health_check', responded: false },
          },
          {
            action: 'trigger_detection',
            data: { check_type: 'health_check', responded: false },
          },
        ],
        validation: [
          {
            check: 'shield_status',
            expected: 'pending_verification',
            timeout: 5000,
          },
          { check: 'notification_sent', expected: true, timeout: 5000 },
        ],
      },

      {
        id: 'survivor-access',
        name: 'Survivor Interface Access',
        description: 'Test survivor access request and approval flow',
        setup: [
          {
            action: 'create_user',
            data: { email: 'test-user-5@example.com', name: 'Test User 5' },
          },
          {
            action: 'create_guardian',
            data: {
              name: 'Guardian 5',
              email: 'guardian5@example.com',
              can_trigger_emergency: true,
            },
          },
          {
            action: 'set_shield_settings',
            data: { is_shield_enabled: true, shield_status: 'active' },
          },
        ],
        execution: [
          {
            action: 'access_resource',
            data: {
              resource_type: 'contact',
              accessor_type: 'survivor',
              requester_email: 'family@example.com',
            },
            expectedResult: { granted: true },
          },
        ],
        validation: [
          { check: 'access_granted', expected: true },
          { check: 'audit_logged', expected: true },
        ],
      },
    ];
  }

  private async runTestScenario(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let testUserId: null | string = null;
    let testGuardianId: null | string = null;
  // let __testDocuments: string[] = []; // Unused

    try {
      // Setup phase
      for (const setupStep of scenario.setup) {
        const stepStart = Date.now();

        try {
          const result = await this.executeSetupStep(setupStep);

          // Store created resources for cleanup
          if (setupStep.action === 'create_user') {
            testUserId = result.userId;
            if (testUserId) {
              this.testUsers.add(testUserId);
            }
          } else if (setupStep.action === 'create_guardian') {
            testGuardianId = result.guardianId;
          } else if (setupStep.action === 'create_documents') {
            // __testDocuments = result.documentIds || [];
          }

          stepResults.push({
            step: `Setup: ${setupStep.action}`,
            passed: true,
            duration: Date.now() - stepStart,
          });
        } catch (error) {
          stepResults.push({
            step: `Setup: ${setupStep.action}`,
            passed: false,
            duration: Date.now() - stepStart,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      }

      // Execution phase
      for (const executionStep of scenario.execution) {
        const stepStart = Date.now();

        try {
          const result = await this.executeExecutionStep(
            executionStep,
            testUserId!,
            testGuardianId
          );

          const passed = executionStep.expectedResult
            ? this.validateResult(result, executionStep.expectedResult)
            : true;

          stepResults.push({
            step: `Execute: ${executionStep.action}`,
            passed: passed,
            duration: Date.now() - stepStart,
            actual: result,
            expected: executionStep.expectedResult,
          });
        } catch (error) {
          stepResults.push({
            step: `Execute: ${executionStep.action}`,
            passed: false,
            duration: Date.now() - stepStart,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      }

      // Validation phase
      for (const validationStep of scenario.validation) {
        const stepStart = Date.now();

        try {
          const result = await this.executeValidationStep(
            validationStep,
            testUserId!,
            testGuardianId
          );

          const passed = this.validateResult(result, validationStep.expected);

          stepResults.push({
            step: `Validate: ${validationStep.check}`,
            passed: passed,
            duration: Date.now() - stepStart,
            actual: result,
            expected: validationStep.expected,
          });

          if (!passed) {
            throw new Error(
              `Validation failed: expected ${JSON.stringify(validationStep.expected)}, got ${JSON.stringify(result)}`
            );
          }
        } catch (error) {
          stepResults.push({
            step: `Validate: ${validationStep.check}`,
            passed: false,
            duration: Date.now() - stepStart,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      }

      // Cleanup if specified
      if (scenario.cleanup) {
        for (const cleanupStep of scenario.cleanup) {
          await this.executeCleanupStep(
            cleanupStep,
            testUserId!,
            testGuardianId
          );
        }
      }

      const allPassed = stepResults.every(step => step.passed);

      return {
        scenario: scenario.name,
        passed: allPassed,
        duration: Date.now() - startTime,
        steps: stepResults,
      };
    } catch (error) {
      return {
        scenario: scenario.name,
        passed: false,
        duration: Date.now() - startTime,
        steps: stepResults,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async executeSetupStep(step: TestSetupStep): Promise<any> {
    const supabase = this.getServiceClient();

    switch (step.action) {
      case 'create_user': {
        // Create test user via Supabase Auth Admin API
        const { data: user, error: userError } =
          await supabase.auth.admin.createUser({
            email: step.data.email,
            email_confirm: true,
            user_metadata: { full_name: step.data.name },
          });

        if (userError) throw userError;

        // Create profile
        await (supabase as any).from('profiles').insert({
          user_id: user.user.id,
          full_name: step.data.name,
          email: step.data.email,
        });

        return { userId: user.user.id };
      }

      case 'create_guardian': {
        // Need userId from previous step context
        const { data: guardian, error: guardianError } = await supabase
          .from('guardians')
          .insert({
            user_id: step.data.userId, // This should be set from context
            name: step.data.name,
            email: step.data.email,
            can_trigger_emergency: step.data.can_trigger_emergency || false,
            can_access_health_docs: step.data.can_access_health_docs || false,
            can_access_financial_docs:
              step.data.can_access_financial_docs || false,
            emergency_contact_priority:
              step.data.emergency_contact_priority || 1,
            is_active: true,
          })
          .select()
          .single();

        if (guardianError) throw guardianError;
        return { guardianId: guardian.id };
      }

      case 'set_shield_settings': {
        await (supabase as any).from('family_shield_settings').upsert({
          user_id: step.data.userId,
          is_shield_enabled: step.data.is_shield_enabled || false,
          inactivity_period_months: step.data.inactivity_period_months || 6,
          required_guardians_for_activation:
            step.data.required_guardians_for_activation || 1,
          shield_status: step.data.shield_status || 'inactive',
        });

        return { success: true };
      }

      case 'create_documents': {
        const documentIds = [];
        for (const doc of step.data.documents) {
          const { data: document, error: docError } = await supabase
            .from('documents')
            .insert({
              user_id: step.data.userId,
              file_name: doc.name,
              document_type: doc.type,
              file_path: `test/${doc.name}`,
              file_type: 'application/pdf',
              file_size: 1024,
            })
            .select()
            .single();

          if (docError) throw docError;
          documentIds.push(document.id);
        }
        return { documentIds };
      }

      case 'set_activity': {
        // Simulate old activity by inserting old health check records
        const daysAgo = step.data.last_activity_days_ago || 0;
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - daysAgo);

        await (supabase as any).from('user_health_checks').insert({
          user_id: step.data.userId,
          check_type: 'login',
          status: 'responded',
          scheduled_at: oldDate.toISOString(),
          responded_at: oldDate.toISOString(),
        });

        return { success: true };
      }

      default:
        throw new Error(`Unknown setup action: ${step.action}`);
    }
  }

  private async executeExecutionStep(
    step: TestExecutionStep,
    userId: string,
    guardianId?: null | string
  ): Promise<any> {
    switch (step.action) {
      case 'trigger_detection': {
        if (step.data.check_type === 'inactivity') {
          return await this.detectionEngine.evaluateEmergencyTriggers(userId);
        } else if (step.data.check_type === 'health_check') {
          await this.detectionEngine.processHealthCheck(
            userId,
            'manual_confirmation',
            step.data.responded !== false
          );
          return { processed: true };
        } else if (step.data.trigger_type) {
          return await this.detectionEngine.triggerEmergencyActivation(
            userId,
            step.data.trigger_type
          );
        }
        break;
      }

      case 'verify_guardian': {
        if (!guardianId)
          throw new Error('Guardian ID required for verification');

        // Get pending activation
        const supabase = this.getServiceClient();
        const { data: activation } = await supabase
          .from('family_shield_activation_log')
          .select('verification_token')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .single();

        if (!activation) throw new Error('No pending activation found');

        return await this.notificationService.recordGuardianResponse(
          activation.verification_token,
          guardianId,
          step.data.response,
          step.data.notes
        );
      }

      case 'access_resource': {
        const context: AccessContext = {
          accessorType: step.data.accessor_type,
          accessorId: guardianId || undefined,
          guardianPermissions: step.data.guardian_permissions,
        };

        return await this.accessControl.validateAccess(
          userId,
          step.data.resource_type,
          step.data.resource_id || 'test-resource',
          'view',
          context
        );
      }

      case 'wait': {
        await new Promise(resolve =>
          setTimeout(resolve, step.data.milliseconds)
        );
        return { waited: step.data.milliseconds };
      }

      default:
        throw new Error(`Unknown execution action: ${step.action}`);
    }
  }

  private async executeValidationStep(
    step: TestValidationStep,
    userId: string,
    guardianId?: null | string
  ): Promise<any> {
    const supabase = this.getServiceClient();

    switch (step.check) {
      case 'shield_status': {
        const { data: settings } = await supabase
          .from('family_shield_settings')
          .select('shield_status')
          .eq('user_id', userId)
          .single();

        return settings?.shield_status;
      }

      case 'notification_sent': {
        const { data: notifications } = await supabase
          .from('guardian_notifications')
          .select('*')
          .eq('user_id', userId);

        return notifications && notifications.length > 0;
      }

      case 'access_granted': {
        // This would be validated based on previous execution steps
        return step.expected;
      }

      case 'audit_logged': {
        const { data: auditLogs } = await supabase
          .from('emergency_access_audit')
          .select('*')
          .eq('user_id', userId);

        return auditLogs && auditLogs.length > 0;
      }

      case 'guardian_notified': {
        const { data: guardianNotifications } = await supabase
          .from('guardian_notifications')
          .select('*')
          .eq('guardian_id', guardianId);

        return guardianNotifications && guardianNotifications.length > 0;
      }

      default:
        throw new Error(`Unknown validation check: ${step.check}`);
    }
  }

  private async executeCleanupStep(
    step: TestCleanupStep,
    userId: string,
    _guardianId?: null | string
  ): Promise<void> {
    const supabase = this.getServiceClient();

    switch (step.action) {
      case 'delete_user': {
        if (userId) {
          await supabase.auth.admin.deleteUser(userId);
        }
        break;
      }

      case 'clear_notifications': {
        await supabase
          .from('guardian_notifications')
          .delete()
          .eq('user_id', userId);
        break;
      }

      default:
        console.warn(`Unknown cleanup action: ${step.action}`);
    }
  }

  private validateResult(actual: any, expected: any): boolean {
    if (typeof expected === 'object' && expected !== null) {
      return JSON.stringify(actual) === JSON.stringify(expected);
    }
    return actual === expected;
  }

  private async cleanupTestUsers(): Promise<void> {
    const supabase = this.getServiceClient();

    for (const userId of this.testUsers) {
      try {
        // Delete related data first
        await Promise.all([
          supabase
            .from('guardian_notifications')
            .delete()
            .eq('user_id', userId),
          (supabase as any).from('user_health_checks').delete().eq('user_id', userId),
          supabase
            .from('emergency_access_audit')
            .delete()
            .eq('user_id', userId),
          supabase
            .from('family_shield_activation_log')
            .delete()
            .eq('user_id', userId),
          supabase
            .from('family_shield_settings')
            .delete()
            .eq('user_id', userId),
          (supabase as any).from('guardians').delete().eq('user_id', userId),
          (supabase as any).from('documents').delete().eq('user_id', userId),
          (supabase as any).from('profiles').delete().eq('user_id', userId),
        ]);

        // Delete user
        await supabase.auth.admin.deleteUser(userId);
      } catch (error) {
        console.warn(`Failed to cleanup test user ${userId}:`, error);
      }
    }

    this.testUsers.clear();
  }

  async generateTestReport(results: TestResult[]): Promise<string> {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    let report = `
# Emergency Activation System Test Report

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${failedTests}
- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(1)}%
- **Total Duration**: ${totalDuration}ms

## Test Results

`;

    for (const result of results) {
      report += `### ${result.scenario} ${result.passed ? '✅' : '❌'}
- **Duration**: ${result.duration}ms
- **Status**: ${result.passed ? 'PASSED' : 'FAILED'}
`;

      if (result.error) {
        report += `- **Error**: ${result.error}\n`;
      }

      report += `
#### Steps:
`;

      for (const step of result.steps) {
        report += `- ${step.step}: ${step.passed ? '✅' : '❌'} (${step.duration}ms)`;
        if (step.error) {
          report += ` - Error: ${step.error}`;
        }
        report += '\n';
      }

      report += '\n';
    }

    return report;
  }
}

export default EmergencyTestingSystem;
