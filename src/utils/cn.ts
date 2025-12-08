import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Temporary fallback until we install the dependencies
export function cn_fallback(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

// SHA-512 hash function for password hashing
export async function hashStringWithSha512(input: string): Promise<string> {
  try {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Use Web Crypto API to hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);

    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('Error hashing string:', error);
    throw new Error('Failed to hash string');
  }
}