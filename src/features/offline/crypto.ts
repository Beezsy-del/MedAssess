export async function createDeviceKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
}
export async function sealDraft(key: CryptoKey, data: unknown, scope: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(scope) },
    key,
    new TextEncoder().encode(JSON.stringify(data)),
  );
  return { iv, ciphertext };
}
export async function openDraft(
  key: CryptoKey,
  sealed: { iv: Uint8Array<ArrayBuffer>; ciphertext: ArrayBuffer },
  scope: string,
) {
  const clear = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: sealed.iv,
      additionalData: new TextEncoder().encode(scope),
    },
    key,
    sealed.ciphertext,
  );
  return JSON.parse(new TextDecoder().decode(clear)) as Record<string, unknown>;
}
