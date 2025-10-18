'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocument(docRef: DocumentReference, data: any, options?: SetOptions) {
  const operation = options && 'merge' in options && options.merge ? 'update' : 'create';
  setDoc(docRef, data, options || {}).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: operation,
        requestResourceData: data,
      })
    )
  })
}


/**
 * Initiates an addDoc operation for a collection reference (non-blocking).
 * It now correctly handles errors and surfaces them via the errorEmitter.
 */
export function addDocument(colRef: CollectionReference, data: any) {
    addDoc(colRef, data).catch(error => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: colRef.path,
                operation: 'create',
                requestResourceData: data,
            })
        );
    });
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocument(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocument(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
