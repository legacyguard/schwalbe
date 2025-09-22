'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccessControlStore } from '../../stores/useAccessControlStore'
import { useSofiaStore } from '../../stores/useSofiaStore'

export interface AccessRole {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystemRole: boolean
  userCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Permission {
  id: string
  resource: 'documents' | 'timecapsules' | 'templates' | 'backups' | 'settings' | 'users'
  action: 'create' | 'read' | 'update' | 'delete' | 'share' | 'admin'
  conditions?: PermissionCondition[]
  scope: 'own' | 'shared' | 'all'
}

export interface PermissionCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

export interface UserAccess {
  userId: string
  email: string
  name: string
  roles: string[]
  directPermissions: Permission[]
  lastLogin: Date | null
  isActive: boolean
  emergencyAccess: boolean
  sessionExpiry: Date | null
}

export interface AccessAuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

const AccessControlManager: React.FC = () => {
  const {
    roles,
    userAccess,
    auditLogs,
    rlsPolicies,
    loadAccessControl,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    revokeRole,
    grantPermission,
    revokePermission,
    enableEmergencyAccess,
    disableEmergencyAccess,
    getAuditLogs,
    updateRLSPolicy
  } = useAccessControlStore()

  const { addMessage, isVisible } = useSofiaStore()

  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'audit' | 'policies'>('roles')
  const [selectedRole, setSelectedRole] = useState<AccessRole | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserAccess | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [auditFilter, setAuditFilter] = useState('')

  useEffect(() => {
    loadAccessControl()
  }, [])

  const handleCreateRole = async (roleData: Omit<AccessRole, 'id' | 'userCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const roleId = await createRole(roleData)

      if (isVisible) {
        addMessage({
          id: `role-created-${Date.now()}`,
          type: 'success',
          content: `Nová rola "${roleData.name}" bola úspešne vytvorená! Môžeš ju teraz priradiť používateľom. 👥✨`,
          timestamp: new Date(),
          priority: 'medium'
        })
      }

      setShowRoleModal(false)
      return roleId
    } catch (error) {
      console.error('Role creation error:', error)
    }
  }

  const handleRoleAssignment = async (userId: string, roleId: string) => {
    try {
      await assignRole(userId, roleId)

      if (isVisible) {
        addMessage({
          id: `role-assigned-${Date.now()}`,
          type: 'success',
          content: 'Rola bola úspešne priradená! Používateľ má teraz nové oprávnenia. 🔓',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Role assignment error:', error)
    }
  }

  const handleEmergencyAccess = async (userId: string, enable: boolean) => {
    try {
      if (enable) {
        await enableEmergencyAccess(userId, 'family_emergency')
      } else {
        await disableEmergencyAccess(userId)
      }

      if (isVisible) {
        addMessage({
          id: `emergency-access-${Date.now()}`,
          type: enable ? 'warning' : 'info',
          content: enable
            ? 'Núdzový prístup bol aktivovaný. Používateľ má dočasne rozšírené oprávnenia. 🚨'
            : 'Núdzový prístup bol deaktivovaný. Oprávnenia sa vrátili na normálnu úroveň. ✅',
          timestamp: new Date(),
          priority: 'high'
        })
      }
    } catch (error) {
      console.error('Emergency access error:', error)
    }
  }

  const getRoleIcon = (roleName: string) => {
    const icons: Record<string, string> = {
      'Owner': '👑',
      'Guardian': '🛡️',
      'Family Member': '👨‍👩‍👧‍👦',
      'Trusted Contact': '🤝',
      'Legal Representative': '⚖️',
      'Emergency Contact': '🚨'
    }
    return icons[roleName] || '👤'
  }

  const getResourceIcon = (resource: string) => {
    const icons: Record<string, string> = {
      documents: '📄',
      timecapsules: '⏰',
      templates: '📋',
      backups: '💾',
      settings: '⚙️',
      users: '👥'
    }
    return icons[resource] || '📋'
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'text-green-600 bg-green-50',
      read: 'text-blue-600 bg-blue-50',
      update: 'text-yellow-600 bg-yellow-50',
      delete: 'text-red-600 bg-red-50',
      share: 'text-purple-600 bg-purple-50',
      admin: 'text-gray-600 bg-gray-50'
    }
    return colors[action] || 'text-gray-600 bg-gray-50'
  }

  const getRiskLevelColor = (riskLevel: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    }
    return colors[riskLevel] || 'text-gray-600 bg-gray-50'
  }

  const filteredAuditLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.resource.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.userId.toLowerCase().includes(auditFilter.toLowerCase())
  )

  return (
    <div className="access-control-manager max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Správa prístupov</h1>
        <p className="text-gray-600">
          Pokročilá kontrola prístupu s Row Level Security a detailným auditovaním.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {[
          { id: 'roles', label: 'Roly', icon: '👥', count: roles.length },
          { id: 'users', label: 'Používatelia', icon: '👤', count: userAccess.length },
          { id: 'audit', label: 'Audit log', icon: '📊', count: auditLogs.length },
          { id: 'policies', label: 'RLS Politiky', icon: '🔒', count: rlsPolicies.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Správa rolí</h2>
              <button
                onClick={() => setShowRoleModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Pridať rolu
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  whileHover={{ scale: 1.02 }}
                  layout
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getRoleIcon(role.name)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.userCount} používateľov</p>
                      </div>
                    </div>
                    {role.isSystemRole && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Systémová
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Oprávnenia:</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 6).map((permission) => (
                        <span
                          key={`${permission.resource}-${permission.action}`}
                          className={`px-2 py-1 text-xs rounded ${getActionColor(permission.action)}`}
                        >
                          {getResourceIcon(permission.resource)} {permission.action}
                        </span>
                      ))}
                      {role.permissions.length > 6 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{role.permissions.length - 6} ďalších
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedRole(role)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Detaily
                    </button>
                    {!role.isSystemRole && (
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Zmazať
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Správa používateľov</h2>

            <div className="space-y-4">
              {userAccess.map((user) => (
                <motion.div
                  key={user.userId}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  layout
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex space-x-2">
                          <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {user.emergencyAccess && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                              🚨 Núdzový prístup
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Roly:</span>
                          <div className="mt-1 space-x-1">
                            {user.roles.map((roleId) => {
                              const role = roles.find(r => r.id === roleId)
                              return role ? (
                                <span key={roleId} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {getRoleIcon(role.name)} {role.name}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium">Posledné prihlásenie:</span>
                          <br />
                          {user.lastLogin ? user.lastLogin.toLocaleString('sk-SK') : 'Nikdy'}
                        </div>

                        <div>
                          <span className="font-medium">Session expiry:</span>
                          <br />
                          {user.sessionExpiry ? user.sessionExpiry.toLocaleString('sk-SK') : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEmergencyAccess(user.userId, !user.emergencyAccess)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          user.emergencyAccess
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        }`}
                      >
                        {user.emergencyAccess ? 'Deaktivovať núdzový prístup' : 'Aktivovať núdzový prístup'}
                      </button>

                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Upraviť
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Audit log</h2>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  placeholder="Filtrovať logy..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => getAuditLogs({ limit: 100 })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Obnoviť
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredAuditLogs.map((log) => (
                <motion.div
                  key={log.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                  layout
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{log.action}</span>
                          <span className="text-gray-500">na</span>
                          <span className="font-medium text-gray-700">{log.resource}</span>
                          {log.resourceId && (
                            <>
                              <span className="text-gray-500">ID:</span>
                              <span className="text-sm font-mono text-gray-600">{log.resourceId}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.userId} • {log.timestamp.toLocaleString('sk-SK')} • {log.ipAddress}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${getRiskLevelColor(log.riskLevel)}`}>
                        {log.riskLevel}
                      </span>
                      {!log.success && log.errorMessage && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          Error
                        </span>
                      )}
                    </div>
                  </div>

                  {!log.success && log.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                      {log.errorMessage}
                    </div>
                  )}
                </motion.div>
              ))}

              {filteredAuditLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Žiadne logy nenájdené</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <motion.div
            key="policies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Row Level Security Politiky</h2>

            <div className="space-y-4">
              {rlsPolicies.map((policy) => (
                <motion.div
                  key={policy.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  layout
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                      <p className="text-sm text-gray-500">Tabuľka: {policy.tableName}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.isActive ? 'Aktívna' : 'Neaktívna'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {policy.operation}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{policy.description}</p>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">SQL Podmienka:</h4>
                    <code className="text-sm text-gray-800 font-mono">{policy.sqlCondition}</code>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Posledná zmena: {policy.updatedAt.toLocaleDateString('sk-SK')}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateRLSPolicy(policy.id, { isActive: !policy.isActive })}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          policy.isActive
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {policy.isActive ? 'Deaktivovať' : 'Aktivovať'}
                      </button>
                      <button className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        Upraviť
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sofia Security Insight */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🛡️</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Sofia o bezpečnosti prístupov</h4>
            <p className="text-gray-700">
              Všetky prístupy sú chránené pokročilými RLS politikami a každá akcia je auditovaná.
              Sleduje som {auditLogs.filter(log => log.riskLevel === 'high' || log.riskLevel === 'critical').length} vyššie
              rizikových aktivít za posledných 30 dní. Núdzové prístupy sú aktivované len v špecifických situáciách
              a automaticky sa deaktivujú po 24 hodinách. Tvoja bezpečnosť je moja priorita! 🔐
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AccessControlManager