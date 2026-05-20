import React, { useEffect, useState } from "react";

export default function MfaSettings({ supabase, setToast }) {
  const [loading, setLoading] = useState(false);
  const [factors, setFactors] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    loadFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFactors() {
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      setToast(error.message);
      return;
    }

    setFactors(data?.totp || []);
  }

  async function startEnrollment() {
    setLoading(true);
    setCode("");

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "The Trotting Stable App"
    });

    if (error) {
      setToast(error.message);
      setLoading(false);
      return;
    }

    setEnrollment(data);
    setLoading(false);
  }

  async function verifyEnrollment(event) {
    event.preventDefault();

    if (!enrollment?.id) {
      setToast("Start two-factor setup first.");
      return;
    }

    const cleanCode = code.replace(/\D/g, "");

    if (cleanCode.length !== 6) {
      setToast("Enter the 6-digit authenticator code.");
      return;
    }

    setLoading(true);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enrollment.id
    });

    if (challengeError) {
      setToast(challengeError.message);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId: enrollment.id,
      challengeId: challenge.id,
      code: cleanCode
    });

    if (error) {
      setToast(error.message);
      setLoading(false);
      return;
    }

    setToast("Two-factor authentication enabled.");
    setEnrollment(null);
    setCode("");
    await loadFactors();
    setLoading(false);
  }

  async function disableFactor(factorId) {
    if (!window.confirm("Disable two-factor authentication for this account?")) return;

    setLoading(true);

    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      setToast(error.message);
    } else {
      setToast("Two-factor authentication disabled.");
      await loadFactors();
    }

    setLoading(false);
  }

  const verifiedFactors = factors.filter(factor => factor.status === "verified");
  const pendingFactors = factors.filter(factor => factor.status !== "verified");
  const enabled = verifiedFactors.length > 0;

  return (
    <div className="settings-actions mfa-settings">
      <p className={`security-status ${enabled ? "enabled" : "disabled"}`}>
        {enabled ? "2FA enabled for this account" : "2FA not enabled for this account"}
      </p>

      <p className="muted">
        Designed for fresh logins, new browsers and new devices. Existing remembered sessions should not be interrupted every morning.
      </p>

      {enabled && verifiedFactors.map(factor => (
        <div className="factor-row" key={factor.id}>
          <span>{factor.friendly_name || "Authenticator app"}</span>
          <button className="danger small" type="button" disabled={loading} onClick={() => disableFactor(factor.id)}>
            Disable
          </button>
        </div>
      ))}

      {!enabled && !enrollment && (
        <button className="ghost" type="button" disabled={loading} onClick={startEnrollment}>
          {loading ? "Starting..." : "Enable Two-Factor Authentication"}
        </button>
      )}

      {enrollment && (
        <form className="form-grid" onSubmit={verifyEnrollment}>
          <p className="muted">
            Scan this QR code with Google Authenticator, Authy, 1Password or another authenticator app, then enter the 6-digit code.
          </p>

          {enrollment.totp?.qr_code && (
            <div className="qr-card">
              <img src={enrollment.totp.qr_code} alt="Two-factor setup QR code" />
            </div>
          )}

          {enrollment.totp?.secret && (
            <p className="muted">Manual setup key: <strong>{enrollment.totp.secret}</strong></p>
          )}

          <label className="field">
            <span>6-digit code</span>
            <input
              className="mfa-code-input"
              inputMode="numeric"
              maxLength="6"
              value={code}
              onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>

          <button className="primary full" disabled={loading}>
            {loading ? "Verifying..." : "Verify and Enable 2FA"}
          </button>

          <button className="text" type="button" onClick={() => { setEnrollment(null); setCode(""); }}>
            Cancel setup
          </button>
        </form>
      )}

      {pendingFactors.length > 0 && !enrollment && (
        <button className="text" type="button" disabled={loading} onClick={() => disableFactor(pendingFactors[0].id)}>
          Clear unfinished 2FA setup
        </button>
      )}
    </div>
  );
}
