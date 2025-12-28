/**
 * SHA-256 hash generation utility for file deduplication.
 *
 * This utility generates cryptographically secure SHA-256 hashes for file content
 * to enable deduplication. The hash is calculated on the raw file bytes and
 * returned as a lowercase hexadecimal string.
 *
 * Security Notes:
 * - Uses Web Crypto API for secure hash calculation
 * - No file content is sent over network during hashing
 * - Hash is calculated client-side for privacy
 *
 * @param {File|Blob} file - The file or blob to hash
 * @returns {Promise<string>} SHA-256 hash as 64-character hexadecimal string
 *
 * @example
 * // Hash a file before upload
 * const fileInput = document.getElementById('file-input');
 * const file = fileInput.files[0];
 * const hash = await generateSHA256(file);
 * console.log('File hash:', hash); // e.g., "a665a459..."
 *
 * @example
 * // Check for duplicates before upload
 * const hash = await generateSHA256(file);
 * const duplicateCheck = await fileService.checkDuplicate(hash);
 * if (duplicateCheck.is_duplicate) {
 *   alert('This file already exists in the system!');
 * }
 *
 * @throws {Error} When file reading fails or crypto operations fail
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API Web Crypto API}
 */
export const generateSHA256 = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};
