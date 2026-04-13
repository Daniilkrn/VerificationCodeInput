import { useCallback, useState } from "react";
import styles from "./App.module.scss";
import AuthWebGLBackground from "./components/authBackground/AuthWebGLBackground";
import AuthEmail from "./components/authEmail/AuthEmail";
import VerificationCode from "./components/verificationCode/VerificationCode";
import {
  clearPendingVerification,
  verifyStoredCode,
} from "./utils/emailJsVerification";

type Step = "email" | "code" | "success";

function App() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isCodeValid, setIsCodeValid] = useState(false);

  const dismissVerifyError = useCallback(() => {
    setVerifyError(null);
    setIsCodeValid(false);
  }, []);

  const handleCodeComplete = (code: string) => {
    setVerifyError(null);
    if (!verifyStoredCode(email, code)) {
      setIsCodeValid(false);
      setVerifyError("Неверный код или срок истёк. Запросите код снова.");
      return;
    }
    setIsCodeValid(true);
  };

  return (
    <main className={styles.root}>
      <AuthWebGLBackground />
      <div className={styles.content}>
        {step === "email" ? (
          <AuthEmail
            onSent={(addr) => {
              setEmail(addr);
              setIsCodeValid(false);
              setVerifyError(null);
              setStep("code");
            }}
          />
        ) : null}

        {step === "code" ? (
          <div className={styles.authFlow}>
            <p className={styles.codeSent}>
              Код отправлен на <strong>{email}</strong>
            </p>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => {
                clearPendingVerification();
                setStep("email");
                setVerifyError(null);
                setIsCodeValid(false);
              }}
            >
              Другой email
            </button>
            <VerificationCode
              onComplete={handleCodeComplete}
              isVerified={isCodeValid}
              onContinue={() => setStep("success")}
              verifyError={verifyError}
              onDismissVerifyError={dismissVerifyError}
            />
          </div>
        ) : null}

        {step === "success" ? (
          <div className={styles.contentCodeSuccess}>
            <h1>Добро пожаловать!</h1>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default App;
