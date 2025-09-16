// Patch application and rollback utilities
// All code and comments are in English.

import type { PatchOperation, WillPatch } from './types';

export interface ApplyResult {
  next: any; // next will JSON structure (partial) to be merged server-side
  inverse: PatchOperation[]; // operations to roll back
}

export function applyPatch(base: any, patch: WillPatch): ApplyResult {
  const clone = deepClone(base);
  const inverse: PatchOperation[] = [];

  for (const op of patch.operations) {
    switch (op.op) {
      case 'set': {
        const { prev } = setPath(clone, op.path, op.value);
        inverse.push(prev === undefined ? { op: 'unset', path: op.path } : { op: 'set', path: op.path, value: prev });
        break;
      }
      case 'unset': {
        const { prev } = unsetPath(clone, op.path);
        if (prev !== undefined) inverse.push({ op: 'set', path: op.path, value: prev });
        break;
      }
      case 'push': {
        const arr = ensureArrayAt(clone, op.path);
        arr.push(op.value);
        inverse.push({ op: 'removeAt', path: op.path, index: arr.length - 1 });
        break;
      }
      case 'removeAt': {
        const arr = ensureArrayAt(clone, op.path);
        const removed = arr.splice(op.index, 1)[0];
        if (removed !== undefined) inverse.push({ op: 'push', path: op.path, value: removed });
        break;
      }
    }
  }

  return { next: clone, inverse };
}

export function rollback(base: any, inverse: PatchOperation[]): any {
  // Apply inverse operations in order
  const clone = deepClone(base);
  for (const op of inverse) {
    switch (op.op) {
      case 'set': setPath(clone, op.path, op.value); break;
      case 'unset': unsetPath(clone, op.path); break;
      case 'push': { const arr = ensureArrayAt(clone, op.path); arr.push(op.value); break; }
      case 'removeAt': { const arr = ensureArrayAt(clone, op.path); arr.splice(op.index, 1); break; }
    }
  }
  return clone;
}

// -----------------------
// Path helpers
// -----------------------

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function splitPath(path: string): string[] {
  return path.split('.').filter(Boolean);
}

function setPath(obj: any, path: string, value: unknown): { parent: any; key: string; prev: unknown } {
  const parts = splitPath(path);
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof curr[p] !== 'object' || curr[p] === null) curr[p] = {};
    curr = curr[p];
  }
  const key = parts[parts.length - 1];
  const prev = curr[key];
  curr[key] = value;
  return { parent: curr, key, prev };
}

function unsetPath(obj: any, path: string): { prev: unknown } {
  const parts = splitPath(path);
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof curr[p] !== 'object' || curr[p] === null) return { prev: undefined };
    curr = curr[p];
  }
  const key = parts[parts.length - 1];
  const prev = curr[key];
  delete curr[key];
  return { prev };
}

function ensureArrayAt(obj: any, path: string): any[] {
  const parts = splitPath(path);
  let curr = obj;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (curr[p] === undefined) curr[p] = i === parts.length - 1 ? [] : {};
    curr = curr[p];
  }
  if (!Array.isArray(curr)) throw new Error(`Path is not an array: ${path}`);
  return curr as any[];
}