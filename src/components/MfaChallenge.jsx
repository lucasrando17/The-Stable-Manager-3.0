import React, { useState } from "react";

export default function MfaChallenge({ supabase, factorId, onVerified, setToast }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  async function submit(event) {
    event.preventDefault();

    const cleanCode = code.replace(/\D/g, "");

    if (!factorId) {
      setMessage("No two-factor factor was found for this account.");
      return;
    }

    if (cleanCode.length !== 6) {
      setMessage("Enter the 6-digit authenticator code.");
      return;
    }

    setChecking(true);
    setMessage("");

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setMessage(challengeError.message);
      setChecking(false);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: cleanCode
    });

    if (error) {
      setMessage(error.message);
      setChecking(false);
      return;
    }

    setToast?.("Two-factor check complete.");
    setChecking(false);
    onVerified?.();
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <h1>Two-Factor Authentication</h1>
        <p>Enter the 6-digit code from your authenticator app.</p>

        <form onSubmit={submit}>
          <label>
            Authenticator Code
            <input
              className="mfa-code-input"
              inputMode="numeric"
              maxLength="6"
              value={code}
              onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>

          <button className="primary full" disabled={checking}>
            {checking ? "Checking..." : "Verify"}
          </button>
        </form>

        <button className="text" type="button" onClick={() => supabase.auth.signOut()}>
          Log out
        </button>

        {message && <p className="login-message">{message}</p>}
      </section>
    </main>
  );
}
