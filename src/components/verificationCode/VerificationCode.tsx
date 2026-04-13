import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import styles from "./VerificationCode.module.scss";
import { svgSprite } from "../../shared";

const DEFAULT_LENGTH = 6;

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

export type VerificationCodeProps = {
  /** Количество ячеек (по умолчанию 6). */
  length?: number;
  /** Вызывается, когда все ячейки заполнены. */
  onComplete?: (code: string) => void;
  /** Код успешно прошел проверку. */
  isVerified?: boolean;
  /** Переход после успешной проверки. */
  onContinue?: () => void;
  /** Текст ошибки с сервера (неверный код и т.п.). */
  verifyError?: string | null;
  /** Сбросить ошибку при правке кода. */
  onDismissVerifyError?: () => void;
};

export default function VerificationCode({
  length = DEFAULT_LENGTH,
  onComplete,
  isVerified = false,
  onContinue,
  verifyError = null,
  onDismissVerifyError,
}: VerificationCodeProps) {
  const [values, setValues] = useState<string[]>(() =>
    Array.from({ length }, () => ""),
  );
  const [sendReady, setSendReady] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusCell = useCallback((index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const lastCompletedRef = useRef<string | null>(null);

  useEffect(() => {
    const code = values.join("");
    const complete =
      code.length === length && values.every((d) => d !== "");
    if (complete) {
      if (lastCompletedRef.current !== code) {
        lastCompletedRef.current = code;
        setSendReady(true);
        onComplete?.(code);
      }
    } else {
      setSendReady(false);
      lastCompletedRef.current = null;
    }
  }, [values, length, onComplete]);

  const handleChange = (index: number, raw: string) => {
    onDismissVerifyError?.();
    const digits = onlyDigits(raw);
    if (digits.length === 0) {
      setValues((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    // Одна цифра в ячейку; если вставили несколько — распределяем от текущей позиции.
    if (digits.length === 1) {
      setValues((prev) => {
        const next = [...prev];
        next[index] = digits;
        return next;
      });
      if (index < length - 1) {
        requestAnimationFrame(() => focusCell(index + 1));
      }
      return;
    }

    let write = index;
    for (const d of digits) {
      if (write >= length) break;
      write += 1;
    }
    const focusIdx = Math.min(write, length - 1);

    setValues((prev) => {
      const next = [...prev];
      let w = index;
      for (const d of digits) {
        if (w >= length) break;
        next[w] = d;
        w += 1;
      }
      return next;
    });
    requestAnimationFrame(() => focusCell(focusIdx));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      (e.key.length === 1 && !e.ctrlKey && !e.metaKey)
    ) {
      onDismissVerifyError?.();
    }
    if (e.key === "Backspace") {
      if (values[index]) {
        e.preventDefault();
        setValues((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        e.preventDefault();
        setValues((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
        focusCell(index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusCell(index - 1);
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    onDismissVerifyError?.();
    const pasted = onlyDigits(e.clipboardData.getData("text"));
    if (!pasted) return;

    let write = index;
    for (const d of pasted) {
      if (write >= length) break;
      write += 1;
    }
    const focusIdx = Math.min(write, length - 1);

    setValues((prev) => {
      const next = [...prev];
      let w = index;
      for (const d of pasted) {
        if (w >= length) break;
        next[w] = d;
        w += 1;
      }
      return next;
    });
    requestAnimationFrame(() => focusCell(focusIdx));
  };

  return (
    <div className={styles.wrap} role="group" aria-label="Код подтверждения">
      <div className={styles.containerCode}>
        {values.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            className={styles.cell}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={index === 0 ? length : 1}
            value={digit}
            aria-label={`Цифра ${index + 1} из ${length}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      {
        sendReady && (
          svgSprite(`${isVerified ? 'done' : 'reject'}`, {
            className: isVerified ? styles.iconVerifiedOk : styles.iconVerifiedFalse
          })
        )
      }
      {verifyError ? (
        <p className={styles.verifyError} role="alert">
          {verifyError}
        </p>
      ) : null}
      {isVerified ? (
        <button className={styles.btn} type="button" onClick={onContinue}>
          Продолжить
        </button>
      ) : null}
    </div>
  );
}
