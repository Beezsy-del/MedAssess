"use client";
import { useState } from "react";
import { staffPasswordSchema } from "@/features/access/staff-password";
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
    const parsed = staffPasswordSchema.safeParse(password);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", password }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to update password.");
      setMessage("Password updated.");
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Connection unavailable. Password update was not confirmed; retry when connected.",
      );
    } finally {
      setBusy(false);
    }
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
            maxLength={72}
          />
        </Field>
        <Field label="Confirm new password">
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={72}
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
