import { useState, type FormEvent } from "react";
import styles from "./AuthEmail.module.scss";
import { sendVerificationCode } from "../../utils/emailJsVerification";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthEmailProps = {
  onSent: (email: string) => void;
};

export default function AuthEmail({ onSent }: AuthEmailProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!emailRegex.test(trimmed)) {
      setError("Введите корректный email");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendVerificationCode(trimmed);
      onSent(trimmed);
    } catch (err) {
      if (err instanceof Error && err.message === "EMAILJS_CONFIG") {
        setError(
          "Не заданы VITE_EMAILJS_* в .env. Скопируйте .env.example и заполните ключи EmailJS.",
        );
        return;
      }
      const msg =
        typeof err === "object" &&
        err !== null &&
        "text" in err &&
        typeof (err as { text?: string }).text === "string"
          ? (err as { text: string }).text
          : "Не удалось отправить письмо";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={styles.wrap}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Вход по email"
    >
      <h1 className={styles.title}>Вход</h1>
      <p className={styles.hint}>
        На почту придёт шестизначный код. Срок действия — 10 минут.
      </p>
      <label className={styles.label} htmlFor="auth-email">
        Email
      </label>
      <input
        id="auth-email"
        className={styles.input}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        placeholder="you@example.com"
      />
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button className={styles.btn} type="submit" disabled={loading}>
        {loading ? "Отправка…" : "Получить код"}
      </button>
    </form>
  );
}
