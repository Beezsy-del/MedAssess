"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { Field } from "@/components/ui";
export function ProfileSettings() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function update(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const password = String(f.get("password"));
    if (password !== f.get("confirm")) {
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error } = await browserClient().auth.updateUser({ password });
    setMessage(
      error
        ? "Unable to update password. Request a fresh recovery link."
        : "Password updated.",
    );
    if (!error) form.reset();
    setBusy(false);
  }
  return (
    <section className="panel detail-panel spaced">
      <h2>Account security</h2>
      <p>
        Use this form after following a password recovery link. Demo credentials
        are shared for synthetic testing; do not change them.
      </p>
      <form className="stack-form" onSubmit={update}>
        <Field label="New password">
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
          />
        </Field>
        <Field label="Confirm new password">
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
          />
        </Field>
        <button disabled={busy} className="button">
          Update password
        </button>
        {message && <p role="status">{message}</p>}
      </form>
    </section>
  );
}
