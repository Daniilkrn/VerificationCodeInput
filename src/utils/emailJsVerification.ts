import emailjs from "@emailjs/browser";

const STORAGE_KEY = "vci_email_auth";
const TTL_MS = 10 * 60 * 1000;

type Pending = {
  email: string;
  code: string;
  expiresAt: number;
};

function getConfig() {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  if (!publicKey || !serviceId || !templateId) {
    throw new Error("EMAILJS_CONFIG");
  }
  return { publicKey, serviceId, templateId };
}

export function clearPendingVerification(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Отправка кода через EmailJS. В шаблоне укажите поле «Кому»: {{user_email}},
 * в теле письма — например: {{passcode}}.
 */
export async function sendVerificationCode(email: string): Promise<void> {
  const { publicKey, serviceId, templateId } = getConfig();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const pending: Pending = {
    email,
    code,
    expiresAt: Date.now() + TTL_MS,
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    emailjs.init({ publicKey });
    await emailjs.send(serviceId, templateId, {
      user_email: email,
      passcode: code,
    });
  } catch (err) {
    sessionStorage.removeItem(STORAGE_KEY);
    throw err;
  }
}

export function verifyStoredCode(email: string, code: string): boolean {
  const normalized = email.trim().toLowerCase();
  const digits = code.replace(/\D/g, "");
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  let pending: Pending;
  try {
    pending = JSON.parse(raw) as Pending;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return false;
  }

  if (pending.expiresAt < Date.now()) {
    sessionStorage.removeItem(STORAGE_KEY);
    return false;
  }
  if (pending.email !== normalized || pending.code !== digits) {
    return false;
  }

  sessionStorage.removeItem(STORAGE_KEY);
  return true;
}
