/** Scoped @noble/hashes 1.x compatibility shim; secure randomness is supplied
 * by Expo, never Math.random. The backup format and KDF are unchanged. */
import { getRandomValues } from 'expo-crypto';
export const crypto = { getRandomValues };
