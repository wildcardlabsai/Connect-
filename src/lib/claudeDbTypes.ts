/* ==========================================================================
   Types for the Claude `db` capability.
   --------------------------------------------------------------------------
   Trimmed to what this codebase actually calls. Copied from the platform's
   own contract (runtime 0.2.48) rather than written from memory — see
   claude-db-README.md for where to re-check these if Claude's contract
   changes.
   ========================================================================== */

export type DbErrorCode =
  | 'invalid_argument'
  | 'resource_exhausted'
  | 'quota_exceeded'
  | 'unavailable'
  | 'revoked'
  | 'not_granted'
  | 'capability_disabled'
  | 'capability_removed'
  | 'transform_error';

export type DbError = { code: DbErrorCode; message: string };

export type SnapshotMetadata = { fromCache: boolean; hasPendingWrites: boolean };

export type DocumentSnapshot = {
  id: string;
  exists: boolean;
  /** A method, not a property. */
  data(): Record<string, unknown> | undefined;
  metadata: SnapshotMetadata;
};

export type QuerySnapshot = {
  docs: DocumentSnapshot[];
  size: number;
  empty: boolean;
  metadata: SnapshotMetadata;
};

export type Unsubscribe = () => void;

export type DocumentReference = {
  id: string;
  path: string;
  get(): Promise<DocumentSnapshot>;
  set(data: Record<string, unknown>): Promise<void>;
  update(data: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
  onSnapshot(next: (snap: DocumentSnapshot) => void, error?: (e: DbError) => void): Unsubscribe;
  collection(path: string): CollectionReference;
};

export type Query = {
  where(field: string, op: string, value: unknown): Query;
  orderBy(field: string, dir?: 'asc' | 'desc'): Query;
  limit(n: number): Query;
  get(): Promise<QuerySnapshot>;
  onSnapshot(next: (snap: QuerySnapshot) => void, error?: (e: DbError) => void): Unsubscribe;
};

export type CollectionReference = Query & {
  path: string;
  doc(id?: string): DocumentReference;
  add(data: Record<string, unknown>): Promise<DocumentReference>;
};

export type DB = {
  doc(path: string): DocumentReference;
  collection(path: string): CollectionReference;
};
