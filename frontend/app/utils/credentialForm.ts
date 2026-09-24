export const CREDENTIAL_LIMITS = {
  titleMin: 2,
  titleMax: 150,
  usernameMax: 255,
  passwordMin: 8,
  passwordMax: 1000,
  urlMax: 500,
  notesMax: 2000,
} as const;

const isHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const validateCredentialForm = (input: {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  requirePassword: boolean;
}): string | null => {
  const title = input.title.trim();
  const username = input.username.trim();
  const password = input.password;
  const url = input.url.trim();
  const notes = input.notes.trim();

  if (title.length < CREDENTIAL_LIMITS.titleMin) {
    return "Nama credential minimal 2 karakter.";
  }
  if (title.length > CREDENTIAL_LIMITS.titleMax) {
    return "Nama credential maksimal 150 karakter.";
  }
  if (username.length > CREDENTIAL_LIMITS.usernameMax) {
    return "Username/email maksimal 255 karakter.";
  }
  if (input.requirePassword && password.length < CREDENTIAL_LIMITS.passwordMin) {
    return "Password minimal 8 karakter.";
  }
  if (password.length > CREDENTIAL_LIMITS.passwordMax) {
    return "Password terlalu panjang.";
  }
  if (url) {
    if (url.length > CREDENTIAL_LIMITS.urlMax) {
      return "URL maksimal 500 karakter.";
    }
    if (!isHttpUrl(url)) {
      return "URL harus valid dan diawali http:// atau https://";
    }
  }
  if (notes.length > CREDENTIAL_LIMITS.notesMax) {
    return "Catatan maksimal 2000 karakter.";
  }
  return null;
};
