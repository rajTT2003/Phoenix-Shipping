import { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import VerifyOTP from "./VerifyOTP";
import ResetPassword from "./ResetPassword";

const PasswordRecoveryFlow = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");  // Track OTP here

  return (
    <div>
      {step === 1 && <ForgotPassword setEmail={setEmail} onNext={() => setStep(2)} />}
      {step === 2 && <VerifyOTP email={email} onVerified={(otp) => { setOtp(otp); setStep(3); }} />}
      {step === 3 && <ResetPassword email={email} otp={otp} />}
    </div>
  );
};

export default PasswordRecoveryFlow;
