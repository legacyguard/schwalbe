import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccessRole, Permission, UserAccess, AccessAuditLog } from '../components/security/AccessControlManager'

interface RLSPolicy {
  id: string
  name: string
  tableName: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
  sqlCondition: string
  description: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface AccessControlStore {
  // State
  roles: AccessRole[]
  userAccess: UserAccess[]
  auditLogs: AccessAuditLog[]
  rlsPolicies: RLSPolicy[]
  isLoading: boolean

  // Actions
  loadAccessControl: () => Promise<void>

  // Role Management
  createRole: (role: Omit<AccessRole, 'id' | 'userCount' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateRole: (roleId: string, updates: Partial<AccessRole>) => Promise<void>
  deleteRole: (roleId: string) => Promise<void>
  assignRole: (userId: string, roleId: string) => Promise<void>
  revokeRole: (userId: string, roleId: string) => Promise<void>

  // Permission Management
  grantPermission: (userId: string, permission: Permission) => Promise<void>
  revokePermission: (userId: string, permissionId: string) => Promise<void>
  checkPermission: (userId: string, resource: string, action: string, context?: any) => Promise<boolean>

  // Emergency Access
  enableEmergencyAccess: (userId: string, reason: string) => Promise<void>
  disableEmergencyAccess: (userId: string) => Promise<void>

  // Audit Logging
  logAccess: (log: Omit<AccessAuditLog, 'id' | 'timestamp'>) => Promise<void>
  getAuditLogs: (filters?: { userId?: string; resource?: string; limit?: number }) => Promise<void>

  // RLS Policy Management
  createRLSPolicy: (policy: Omit<RLSPolicy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateRLSPolicy: (policyId: string, updates: Partial<RLSPolicy>) => Promise<void>
  deleteRLSPolicy: (policyId: string) => Promise<void>
  applyRLSPolicies: () => Promise<void>
}

// Default system roles
const defaultRoles: AccessRole[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Majiteľ účtu s plnými oprávneniami',
    permissions: [
      { id: 'owner-all', resource: 'documents', action: 'admin', scope: 'all' },
      { id: 'owner-all-tc', resource: 'timecapsules', action: 'admin', scope: 'all' },
      { id: 'owner-all-tmpl', resource: 'templates', action: 'admin', scope: 'all' },
      { id: 'owner-all-backup', resource: 'backups', action: 'admin', scope: 'all' },
      { id: 'owner-all-settings', resource: 'settings', action: 'admin', scope: 'all' },
      { id: 'owner-all-users', resource: 'users', action: 'admin', scope: 'all' }
    ],
    isSystemRole: true,
    userCount: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'guardian',
    name: 'Guardian',
    description: 'Opatrovník s prístupom k všetkým dokumentom a časovým kapsulám',
    permissions: [
      { id: 'guardian-read-docs', resource: 'documents', action: 'read', scope: 'all' },
      { id: 'guardian-read-tc', resource: 'timecapsules', action: 'read', scope: 'all' },
      { id: 'guardian-create-backup', resource: 'backups', action: 'create', scope: 'own' }
    ],
    isSystemRole: true,
    userCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'family',
    name: 'Family Member',
    description: 'Rodinný príslušník s prístupom k zdieľaným dokumentom',
    permissions: [
      { id: 'family-read-shared', resource: 'documents', action: 'read', scope: 'shared' },
      { id: 'family-read-tc', resource: 'timecapsules', action: 'read', scope: 'shared',
        conditions: [{ field: 'recipient_id', operator: 'equals', value: '{user_id}' }] }
    ],
    isSystemRole: true,
    userCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'trusted_contact',
    name: 'Trusted Contact',
    description: 'Dôveryhodný kontakt s obmedzeným prístupom',
    permissions: [
      { id: 'trusted-read-emergency', resource: 'documents', action: 'read', scope: 'shared',
        conditions: [{ field: 'category', operator: 'equals', value: 'emergency' }] }
    ],
    isSystemRole: true,
    userCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'legal_rep',
    name: 'Legal Representative',
    description: 'Právny zástupca s prístupom k právnym dokumentom',
    permissions: [
      { id: 'legal-read-legal', resource: 'documents', action: 'read', scope: 'shared',
        conditions: [{ field: 'category', operator: 'equals', value: 'legal' }] },
      { id: 'legal-read-templates', resource: 'templates', action: 'read', scope: 'all' }
    ],
    isSystemRole: true,
    userCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'emergency_contact',
    name: 'Emergency Contact',
    description: 'Kontakt pre núdzové situácie',
    permissions: [
      { id: 'emergency-read-emergency', resource: 'documents', action: 'read', scope: 'shared',
        conditions: [{ field: 'category', operator: 'equals', value: 'emergency' }] }
    ],
    isSystemRole: true,
    userCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// Default RLS policies
const defaultRLSPolicies: RLSPolicy[] = [
  {
    id: 'documents_owner_policy',
    name: 'Documents Owner Access',
    tableName: 'documents',
    operation: 'ALL',
    sqlCondition: 'user_id = auth.uid()',
    description: 'Majiteľ má plný prístup k svojim dokumentom',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'documents_shared_policy',
    name: 'Documents Shared Access',
    tableName: 'documents',
    operation: 'SELECT',
    sqlCondition: `EXISTS (
      SELECT 1 FROM document_shares ds
      WHERE ds.document_id = id
      AND ds.shared_with_user_id = auth.uid()
      AND ds.is_active = true
      AND (ds.expires_at IS NULL OR ds.expires_at > NOW())
    )`,
    description: 'Prístup k zdieľaným dokumentom',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'documents_guardian_policy',
    name: 'Documents Guardian Access',
    tableName: 'documents',
    operation: 'SELECT',
    sqlCondition: `EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'Guardian'
      AND ur.is_active = true
    )`,
    description: 'Opatrovník má prístup k všetkým dokumentom',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'timecapsules_owner_policy',
    name: 'Time Capsules Owner Access',
    tableName: 'time_capsules',
    operation: 'ALL',
    sqlCondition: 'creator_id = auth.uid()',
    description: 'Tvorca má plný prístup k svojim časovým kapsulám',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'timecapsules_recipient_policy',
    name: 'Time Capsules Recipient Access',
    tableName: 'time_capsules',
    operation: 'SELECT',
    sqlCondition: `EXISTS (
      SELECT 1 FROM time_capsule_recipients tcr
      WHERE tcr.time_capsule_id = id
      AND tcr.recipient_user_id = auth.uid()
      AND tcr.is_active = true
    )`,
    description: 'Príjemca má prístup k časovým kapsulám určeným pre neho',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'templates_public_policy',
    name: 'Templates Public Access',
    tableName: 'legal_templates',
    operation: 'SELECT',
    sqlCondition: 'is_public = true OR creator_id = auth.uid()',
    description: 'Prístup k verejným šablónam a vlastným šablónam',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'audit_logs_admin_policy',
    name: 'Audit Logs Admin Access',
    tableName: 'audit_logs',
    operation: 'SELECT',
    sqlCondition: `EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('Owner', 'Guardian')
      AND ur.is_active = true
    )`,
    description: 'Len admini môžu vidieť audit logy',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

export const useAccessControlStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      // Initial state
      roles: defaultRoles,
      userAccess: [],
      auditLogs: [],
      rlsPolicies: defaultRLSPolicies,
      isLoading: false,

      // Actions
      loadAccessControl: async () => {
        set({ isLoading: true })

        try {
          // TODO: Load from Supabase
          // For now, simulate loading
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Generate sample users
          const sampleUsers: UserAccess[] = [
            {
              userId: 'user-1',
              email: 'jan.novak@example.com',
              name: 'Ján Novák',
              roles: ['owner'],
              directPermissions: [],
              lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              isActive: true,
              emergencyAccess: false,
              sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
            },
            {
              userId: 'user-2',
              email: 'anna.novakova@example.com',
              name: 'Anna Nováková',
              roles: ['guardian'],
              directPermissions: [],
              lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
              isActive: true,
              emergencyAccess: false,
              sessionExpiry: new Date(Date.now() + 12 * 60 * 60 * 1000)
            },
            {
              userId: 'user-3',
              email: 'peter.novak@example.com',
              name: 'Peter Novák',
              roles: ['family'],
              directPermissions: [],
              lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              isActive: true,
              emergencyAccess: false,
              sessionExpiry: null
            }
          ]

          // Generate sample audit logs
          const sampleAuditLogs: AccessAuditLog[] = generateSampleAuditLogs()

          set({
            userAccess: sampleUsers,
            auditLogs: sampleAuditLogs,
            isLoading: false
          })
        } catch (error) {
          console.error('Error loading access control:', error)
          set({ isLoading: false })
        }
      },

      // Role Management
      createRole: async (roleData) => {
        const newRole: AccessRole = {
          ...roleData,
          id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set((state) => ({
          roles: [...state.roles, newRole]
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'create_role',
          resource: 'roles',
          resourceId: newRole.id,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'medium'
        })

        return newRole.id
      },

      updateRole: async (roleId, updates) => {
        set((state) => ({
          roles: state.roles.map(role =>
            role.id === roleId
              ? { ...role, ...updates, updatedAt: new Date() }
              : role
          )
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'update_role',
          resource: 'roles',
          resourceId: roleId,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'medium'
        })
      },

      deleteRole: async (roleId) => {
        const role = get().roles.find(r => r.id === roleId)
        if (role?.isSystemRole) {
          throw new Error('Cannot delete system role')
        }

        set((state) => ({
          roles: state.roles.filter(role => role.id !== roleId)
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'delete_role',
          resource: 'roles',
          resourceId: roleId,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'high'
        })
      },

      assignRole: async (userId, roleId) => {
        set((state) => ({
          userAccess: state.userAccess.map(user =>
            user.userId === userId
              ? { ...user, roles: [...user.roles, roleId] }
              : user
          )
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'assign_role',
          resource: 'user_roles',
          resourceId: `${userId}-${roleId}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'medium'
        })
      },

      revokeRole: async (userId, roleId) => {
        set((state) => ({
          userAccess: state.userAccess.map(user =>
            user.userId === userId
              ? { ...user, roles: user.roles.filter(r => r !== roleId) }
              : user
          )
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'revoke_role',
          resource: 'user_roles',
          resourceId: `${userId}-${roleId}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'medium'
        })
      },

      // Permission Management
      grantPermission: async (userId, permission) => {
        set((state) => ({
          userAccess: state.userAccess.map(user =>
            user.userId === userId
              ? { ...user, directPermissions: [...user.directPermissions, permission] }
              : user
          )
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'grant_permission',
          resource: 'permissions',
          resourceId: permission.id,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'medium'
        })
      },

      revokePermission: async (userId, permissionId) => {
        set((state) => ({
          userAccess: state.userAccess.map(user =>
            user.userId === userId
              ? { ...user, directPermissions: user.directPermissions.filter(p => p.id !== permissionId) }
              : user
          )
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'revoke_permission',
          resource: 'permissions',
          resourceId: permissionId,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'medium'
        })
      },

      checkPermission: async (userId, resource, action, context) => {
        try {
          const { userAccess, roles } = get()
          const user = userAccess.find(u => u.userId === userId)

          if (!user || !user.isActive) {
            return false
          }

          // Check direct permissions
          const hasDirectPermission = user.directPermissions.some(p =>
            p.resource === resource &&
            (p.action === action || p.action === 'admin') &&
            checkPermissionConditions(p, context)
          )

          if (hasDirectPermission) return true

          // Check role-based permissions
          const userRoles = roles.filter(r => user.roles.includes(r.id))
          const hasRolePermission = userRoles.some(role =>
            role.permissions.some(p =>
              p.resource === resource &&
              (p.action === action || p.action === 'admin') &&
              checkPermissionConditions(p, context)
            )
          )

          return hasRolePermission
        } catch (error) {
          console.error('Permission check error:', error)
          return false
        }
      },

      // Emergency Access
      enableEmergencyAccess: async (userId, reason) => {
        set((state) => ({
          userAccess: state.userAccess.map(user =>
            user.userId === userId
              ? {
                  ...user,
                  emergencyAccess: true,
                  sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                }
              : user
          )
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'enable_emergency_access',
          resource: 'emergency_access',
          resourceId: userId,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'critical'
        })

        // Auto-disable after 24 hours
        setTimeout(async () => {
          await get().disableEmergencyAccess(userId)
        }, 24 * 60 * 60 * 1000)
      },

      disableEmergencyAccess: async (userId) => {
        set((state) => ({
          userAccess: state.userAccess.map(user =>
            user.userId === userId
              ? { ...user, emergencyAccess: false }
              : user
          )
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'disable_emergency_access',
          resource: 'emergency_access',
          resourceId: userId,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'medium'
        })
      },

      // Audit Logging
      logAccess: async (logData) => {
        const auditLog: AccessAuditLog = {
          ...logData,
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date()
        }

        set((state) => ({
          auditLogs: [auditLog, ...state.auditLogs].slice(0, 1000) // Keep last 1000 logs
        }))

        // TODO: Send to Supabase
        console.log('Audit log:', auditLog)
      },

      getAuditLogs: async (filters = {}) => {
        try {
          // TODO: Fetch from Supabase with filters
          // For now, just filter existing logs
          const { auditLogs } = get()
          let filteredLogs = [...auditLogs]

          if (filters.userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
          }

          if (filters.resource) {
            filteredLogs = filteredLogs.filter(log => log.resource === filters.resource)
          }

          if (filters.limit) {
            filteredLogs = filteredLogs.slice(0, filters.limit)
          }

          set({ auditLogs: filteredLogs })
        } catch (error) {
          console.error('Error fetching audit logs:', error)
        }
      },

      // RLS Policy Management
      createRLSPolicy: async (policyData) => {
        const newPolicy: RLSPolicy = {
          ...policyData,
          id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        set((state) => ({
          rlsPolicies: [...state.rlsPolicies, newPolicy]
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'create_rls_policy',
          resource: 'rls_policies',
          resourceId: newPolicy.id,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'high'
        })

        return newPolicy.id
      },

      updateRLSPolicy: async (policyId, updates) => {
        set((state) => ({
          rlsPolicies: state.rlsPolicies.map(policy =>
            policy.id === policyId
              ? { ...policy, ...updates, updatedAt: new Date() }
              : policy
          )
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'update_rls_policy',
          resource: 'rls_policies',
          resourceId: policyId,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'high'
        })
      },

      deleteRLSPolicy: async (policyId) => {
        set((state) => ({
          rlsPolicies: state.rlsPolicies.filter(policy => policy.id !== policyId)
        }))

        await get().logAccess({
          userId: 'current-user',
          action: 'delete_rls_policy',
          resource: 'rls_policies',
          resourceId: policyId,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          success: true,
          riskLevel: 'critical'
        })
      },

      applyRLSPolicies: async () => {
        try {
          const { rlsPolicies } = get()
          const activePolicies = rlsPolicies.filter(p => p.isActive)

          // TODO: Apply policies to Supabase
          console.log(`Applying ${activePolicies.length} RLS policies`)

          await get().logAccess({
            userId: 'current-user',
            action: 'apply_rls_policies',
            resource: 'rls_policies',
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            success: true,
            riskLevel: 'medium'
          })
        } catch (error) {
          console.error('Error applying RLS policies:', error)
          throw error
        }
      }
    }),
    {
      name: 'access-control-store',
      partialize: (state) => ({
        roles: state.roles,
        rlsPolicies: state.rlsPolicies
      })
    }
  )
)

// Helper functions
function checkPermissionConditions(permission: Permission, context: any): boolean {
  if (!permission.conditions || !context) return true

  return permission.conditions.every(condition => {
    const contextValue = context[condition.field]

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value
      case 'not_equals':
        return contextValue !== condition.value
      case 'contains':
        return String(contextValue).includes(String(condition.value))
      case 'greater_than':
        return Number(contextValue) > Number(condition.value)
      case 'less_than':
        return Number(contextValue) < Number(condition.value)
      default:
        return false
    }
  })
}

function generateSampleAuditLogs(): AccessAuditLog[] {
  const actions = ['login', 'logout', 'view_document', 'create_document', 'update_document', 'delete_document', 'share_document', 'create_timecapsule', 'view_timecapsule']
  const resources = ['documents', 'timecapsules', 'templates', 'settings', 'users']
  const users = ['user-1', 'user-2', 'user-3']
  const riskLevels: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical']

  const logs: AccessAuditLog[] = []

  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
    const success = Math.random() > 0.1 // 90% success rate
    const action = actions[Math.floor(Math.random() * actions.length)]
    const resource = resources[Math.floor(Math.random() * resources.length)]
    const userId = users[Math.floor(Math.random() * users.length)]
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]

    logs.push({
      id: `log-${i}`,
      userId,
      action,
      resource,
      resourceId: success ? `${resource}-${Math.floor(Math.random() * 100)}` : undefined,
      timestamp,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success,
      errorMessage: success ? undefined : 'Access denied - insufficient permissions',
      riskLevel
    })
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}