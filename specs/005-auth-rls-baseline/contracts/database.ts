// Auth + RLS Baseline: Database Contracts
// Defines the interfaces and contracts for database operations

/**
 * Base database entity interface
 * All database entities should extend this interface
 */
export interface BaseEntity {
  /** Primary key */
  id: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * User profile entity
 * Represents a user's profile information
 */
export interface Profile extends BaseEntity {
  /** Supabase Auth user ID (UUID, foreign key to auth.users.id) */
  user_id: string;
  /** User's email address */
  email?: string;
  /** User's first name */
  first_name?: string;
  /** User's last name */
  last_name?: string;
  /** User's avatar URL */
  avatar_url?: string;
}

/**
 * User session entity
 * Represents an active user session for security monitoring
 */
export interface UserSession extends BaseEntity {
  /** Associated user ID */
  user_id: string;
  /** Unique session identifier */
  session_id: string;
  /** IP address of the session */
  ip_address?: string;
  /** User agent string */
  user_agent?: string;
  /** Session expiration timestamp */
  expires_at: string;
  /** Last activity timestamp */
  last_activity: string;
}

/**
 * Audit log entity
 * Represents security and audit events
 */
export interface AuditLog extends BaseEntity {
  /** User ID associated with the event */
  user_id?: string;
  /** Action performed */
  action: string;
  /** Resource type affected */
  resource_type?: string;
  /** Resource ID affected */
  resource_id?: string;
  /** IP address of the request */
  ip_address?: string;
  /** User agent string */
  user_agent?: string;
  /** Additional event metadata */
  metadata?: Record<string, any>;
}

/**
 * Database operation result interface
 */
export interface DatabaseResult<T = any> {
  /** Operation success status */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error information */
  error?: DatabaseError;
  /** Number of affected rows */
  count?: number;
}

/**
 * Database error interface
 */
export interface DatabaseError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Error details */
  details?: any;
  /** SQL state */
  sqlState?: string;
}

/**
 * Database query options interface
 */
export interface QueryOptions {
  /** Select specific columns */
  select?: string;
  /** Filter conditions */
  filters?: Record<string, any>;
  /** Sort options */
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  /** Pagination options */
  pagination?: {
    page: number;
    limit: number;
  };
  /** Include related data */
  include?: string[];
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasNext: boolean;
  /** Whether there are previous pages */
  hasPrev: boolean;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> extends DatabaseResult<T[]> {
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Database transaction interface
 */
export interface DatabaseTransaction {
  /** Execute query within transaction */
  query<T = any>(sql: string, params?: any[]): Promise<DatabaseResult<T>>;
  /** Commit transaction */
  commit(): Promise<void>;
  /** Rollback transaction */
  rollback(): Promise<void>;
}

/**
 * Database client interface
 * Defines the contract for database operations
 */
export interface DatabaseClient {
  /** Execute raw SQL query */
  query<T = any>(sql: string, params?: any[]): Promise<DatabaseResult<T>>;

  /** Find single record by ID */
  findById<T extends BaseEntity>(
    table: string,
    id: string,
    options?: QueryOptions
  ): Promise<DatabaseResult<T>>;

  /** Find multiple records */
  findMany<T extends BaseEntity>(
    table: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>>;

  /** Create new record */
  create<T extends BaseEntity>(
    table: string,
    data: Partial<T>
  ): Promise<DatabaseResult<T>>;

  /** Update existing record */
  update<T extends BaseEntity>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<DatabaseResult<T>>;

  /** Delete record */
  delete(table: string, id: string): Promise<DatabaseResult<boolean>>;

  /** Execute within transaction */
  transaction<T>(
    callback: (tx: DatabaseTransaction) => Promise<T>
  ): Promise<DatabaseResult<T>>;

  /** Check if table exists */
  tableExists(table: string): Promise<boolean>;

  /** Get table schema */
  getTableSchema(table: string): Promise<DatabaseResult<any>>;
}

/**
 * RLS policy interface
 * Defines Row Level Security policies
 */
export interface RLSPolicy {
  /** Policy name */
  name: string;
  /** Target table */
  table: string;
  /** Policy command (SELECT, INSERT, UPDATE, DELETE) */
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  /** Policy roles */
  roles?: string[];
  /** Policy condition */
  using?: string;
  /** Check condition for INSERT/UPDATE */
  check?: string;
  /** Policy description */
  description?: string;
}

/**
 * Database migration interface
 */
export interface DatabaseMigration {
  /** Migration name */
  name: string;
  /** Migration version/timestamp */
  version: string;
  /** Up migration SQL */
  up: string;
  /** Down migration SQL */
  down: string;
  /** Migration description */
  description?: string;
}

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  /** Database host */
  host: string;
  /** Database port */
  port: number;
  /** Database name */
  database: string;
  /** Database username */
  username: string;
  /** Database password */
  password: string;
  /** Connection pool settings */
  pool?: {
    min: number;
    max: number;
    idle: number;
  };
  /** SSL configuration */
  ssl?: boolean | object;
  /** Connection timeout */
  timeout?: number;
}

/**
 * Database health check result
 */
export interface DatabaseHealth {
  /** Service status */
  status: 'healthy' | 'unhealthy' | 'degraded';
  /** Response time in milliseconds */
  responseTime: number;
  /** Connection count */
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  /** Database version */
  version?: string;
  /** Last migration */
  lastMigration?: string;
  /** Error information */
  error?: string;
}

/**
 * Database service interface
 * Defines the contract for database operations service
 */
export interface DatabaseService {
  /** Get database client */
  getClient(): DatabaseClient;

  /** Execute health check */
  healthCheck(): Promise<DatabaseHealth>;

  /** Run pending migrations */
  migrate(): Promise<DatabaseResult<string[]>>;

  /** Rollback migrations */
  rollback(steps?: number): Promise<DatabaseResult<string[]>>;

  /** Create backup */
  createBackup(): Promise<DatabaseResult<string>>;

  /** Restore from backup */
  restoreBackup(backupPath: string): Promise<DatabaseResult<boolean>>;

  /** Get migration status */
  getMigrationStatus(): Promise<DatabaseResult<any[]>>;

  /** Validate RLS policies */
  validateRLS(): Promise<DatabaseResult<any[]>>;

  /** Clean up old data */
  cleanup(retentionDays: number): Promise<DatabaseResult<number>>;
}