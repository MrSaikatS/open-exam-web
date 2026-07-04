import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { serverEnv } from "./env/serverEnv";

/**
 * Type definition for password verification parameters.
 * @typedef {Object} VerifyPasswordType
 * @property {string} hash - The hashed password to verify against
 * @property {string} password - The plain text password to verify
 */
type VerifyPasswordType = {
  hash: string;
  password: string;
};

/**
 * Hashes a password using Argon2 with the application's secret key.
 *
 * This function uses the Argon2 algorithm with a secret key derived from the
 * BETTER_AUTH_SECRET environment variable to create a secure password hash.
 *
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} A promise that resolves to the hashed password
 *
 * @example
 * ```typescript
 * const hashedPassword = await hashPasswordFunction('userPassword123');
 * console.log(hashedPassword); // Argon2 hash string
 * ```
 */
export const hashPasswordFunction = async (password: string) => {
  const hashedPassword = await argon2Hash(password, {
    secret: Buffer.from(serverEnv.BETTER_AUTH_SECRET),
  });

  return hashedPassword;
};

/**
 * Verifies a plain text password against a hashed password using Argon2.
 *
 * This function compares a plain text password with a previously hashed password
 * using the same Argon2 parameters and secret key used for hashing.
 *
 * @param {VerifyPasswordType} data - Object containing the hash and password to verify
 * @param {string} data.hash - The hashed password to verify against
 * @param {string} data.password - The plain text password to verify
 * @returns {Promise<boolean>} A promise that resolves to true if the password matches, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await verifyPasswordFunction({
 *   hash: '$argon2id$v=19$m=65536,t=3,p=4$...',
 *   password: 'userPassword123'
 * });
 * console.log(isValid); // true or false
 * ```
 */
export const verifyPasswordFunction = async (data: VerifyPasswordType) => {
  const { hash, password } = data;

  const verifiedPassword = await argon2Verify(hash, password, {
    secret: Buffer.from(serverEnv.BETTER_AUTH_SECRET),
  });

  return verifiedPassword;
};
