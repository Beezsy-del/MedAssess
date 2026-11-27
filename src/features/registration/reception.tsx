"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Plus,
  Printer,
  Copy,
  RefreshCw,
  CloudUpload,
  UserPlus,
} from "lucide-react";
import { Field, Modal } from "@/components/ui";
import { useWorkspace } from "@/features/workspace/context";
import { PatientTable } from "@/features/workspace/patient-table";
import {
  listOutbox,
  saveOutbox,
  syncOutbox,
  type OutboxItem,
  clearOutbox,
} from "@/features/offline/outbox";

export function QRToken({
  token,
  reference,
}: {
  token: string;
  reference: string;
}) {
  const [image, setImage] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState("");
  const [url] = useState(
    () => `${window.location.origin}/patient/intake/${token}`,
  );
  useEffect(() => {
    void QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then(setImage)
      .catch(() =>
        setQrError(
          "QR image unavailable. Use the intake link or ask reception for assistance.",
        ),
      );
  }, [url]);

  return (
    <div className="qr-token">
      <h3>Patient entry pass</h3>
      <p className="mono">{reference}</p>
      {image && (
        <Image
          unoptimized
          src={image}
          width="240"
          height="240"
          alt="QR code for this encounter's secure intake link"
        />
      )}
      <p>Private encounter link · expires in 24 hours</p>
      <p>No smartphone? Reception can assist you.</p>
      {qrError && (
        <p className="error-text" role="alert">
          {qrError}
        </p>
      )}
      <div className="button-row">
        <button type="button" className="button" onClick={() => window.print()}>
          <Printer size={16} /> Print pass
        </button>
        <button
          type="button"
          className="button"
          onClick={() =>
            void navigator.clipboard
              .writeText(url)
              .then(() => setCopied(true))
              .catch(() =>
                setQrError(
                  "Copy failed. Open the intake link or print the pass.",
                ),
              )
          }
        >
          <Copy size={16} />
          {copied ? "Copied" : "Copy link"}
        </button>
        <Link className="button primary" href={url} target="_blank">
          Open intake
        </Link>
      </div>
    </div>
  );
}

export function Reception() {
  const operation = useRef<string | null>(null);
  const { data, command, busy, online, setMessage, refresh } = useWorkspace();
  const [open, setOpen] = useState(false),
    [unidentified, setUnidentified] = useState(false),
    [existing, setExisting] = useState(""),
    [search, setSearch] = useState(""),
    [qr, setQr] = useState<{ token: string; reference: string } | null>(null),
    [outbox, setOutbox] = useState<OutboxItem[]>([]),
    [syncing, setSyncing] = useState(false),
    [error, setError] = useState("");

  const load = useCallback(
    () =>
      listOutbox(data.userId, data.hospital.id).then((items) =>
        setOutbox(items.filter((item) => item.kind !== "intake-draft")),
      ),
    [data.userId, data.hospital.id],
  );

  useEffect(() => {
    void load().catch(() =>
      setError(
        "Device drafts could not be opened. Keep this device and ask for support.",
      ),
    );
  }, [load]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await syncOutbox(data.userId, data.hospital.id);
      await load();
      await refresh();
      setMessage(
        `${result.synced} offline registrations synchronized. ${result.failed ? `${result.failed} drafts retained for retry.` : ""}`,
      );
    } catch {
      setError(
        "Synchronization or refresh unavailable. Unsynchronized drafts remain on this device.",
      );
    } finally {
      setSyncing(false);
    }
  }, [data.userId, data.hospital.id, load, refresh, setMessage]);

  useEffect(() => {
    const onOnline = () => void sync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [sync]);

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const f = new FormData(event.currentTarget);
    const operation_id = (operation.current ??= crypto.randomUUID());
    const payload = {
      operation_id,
      name: unidentified ? "Unidentified patient" : String(f.get("name") ?? ""),
      age: f.get("age") ? Number(f.get("age")) : null,
      sex: f.get("sex"),
      phone: f.get("phone"),
      symptoms: f.get("symptoms"),
      department_id: f.get("department_id"),
      unidentified,
      emergency: f.get("emergency") === "on",
      ...(existing ? { patient_id: existing } : {}),
    };
    try {
      if (!online) {
        await saveOutbox({
          id: operation_id,
          hospital: data.hospital.id,
          user: data.userId,
          data: payload,
          createdAt: new Date().toISOString(),
          attempts: 0,
        });
        await load();
        operation.current = null;
        setMessage("Saved on this device. Not yet registered at the hospital.");
        setOpen(false);
        return;
      }
      const result = await command("register", payload);
      operation.current = null;
      setOpen(false);
      if (result.token)
        setQr({
          token: String(result.token),
          reference: String(result.reference),
        });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    }
  }

  const filtered = data.encounters.filter((e) =>
    `${e.reference} ${data.patients.find((p) => p.id === e.patient_id)?.name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="page-context">Patient access</p>
          <h1>Reception</h1>
          <p>One patient record. A new encounter for every visit.</p>
        </div>
        <button
          type="button"
          className="button primary"
          onClick={() => {
            setError("");
            setOpen(true);
          }}
        >
          <Plus size={17} /> Register patient
        </button>
      </div>

      <div className="info-strip">
        <UserPlus size={20} />
        <span>
          Patients can register with staff assistance. Emergency care must never
          wait for a form or QR scan.
        </span>
        <Link href="/emergency">Emergency instructions</Link>
      </div>

      <section className="panel">
        <div className="section-title">
          <h2>Registered encounters</h2>
          <input
            placeholder="Search patients"
            aria-label="Search registered patients"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <PatientTable
          encounters={filtered}
          onReset={search ? () => setSearch("") : undefined}
        />
      </section>

      <section className="panel spaced">
        <div className="section-title">
          <h2>
            <CloudUpload size={18} /> Device synchronization
          </h2>
          <button
            type="button"
            className="button"
            onClick={() => void sync()}
            disabled={!online || syncing}
          >
            <RefreshCw size={15} />
            {syncing ? "Synchronizing…" : "Sync now"}
          </button>
        </div>
        <p className="panel-copy">
          {outbox.length} drafts on this device. Local capture does not notify
          other devices. Synced payloads are removed; sign-out clears remaining
          drafts.
        </p>
        {outbox.map((o) => (
          <div className="list-row" key={o.id}>
            <span>
              Local registration · {new Date(o.createdAt).toLocaleString()}
              <small>{o.error ?? "Waiting for synchronization"}</small>
            </span>
            <span>{o.attempts} attempts</span>
          </div>
        ))}
        {outbox.length > 0 && (
          <div className="panel-copy">
            <button
              type="button"
              className="button"
              onClick={() => {
                if (confirm("Delete all unsynchronized drafts on this device?"))
                  void clearOutbox().then(load);
              }}
            >
              Delete local drafts
            </button>
          </div>
        )}
      </section>

      {open && (
        <Modal
          title="Register a patient"
          onClose={() => {
            setOpen(false);
            setError("");
          }}
        >
          <form onSubmit={register} className="stack-form">
            <p className="form-note">
              Synthetic data only. For an emergency, alert staff immediately
              before completing registration.
            </p>
            <Field label="Existing patient (optional)">
              <select
                value={existing}
                onChange={(e) => setExisting(e.target.value)}
              >
                <option value="">Create a new patient record</option>
                {data.patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.age ?? "Unknown"} years · {p.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </Field>
            {!existing && (
              <>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={unidentified}
                    onChange={(e) => setUnidentified(e.target.checked)}
                  />
                  Unidentified patient / details unavailable
                </label>
                <Field label="Full name">
                  <input
                    name="name"
                    required={!unidentified}
                    disabled={unidentified}
                    maxLength={160}
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Age (if known)">
                    <input type="number" min="0" max="130" name="age" />
                  </Field>
                  <Field label="Sex (if clinically relevant)">
                    <select name="sex">
                      <option value="">Not recorded</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Intersex</option>
                      <option>Prefer not to say</option>
                    </select>
                  </Field>
                </div>
                <Field label="Contact number (optional)">
                  <input name="phone" type="tel" maxLength={30} />
                </Field>
              </>
            )}
            <Field label="Department">
              <select name="department_id">
                <option value="">Awaiting assignment</option>
                {data.departments.map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Presenting complaint / information available">
              <textarea name="symptoms" maxLength={3000} />
            </Field>
            <label className="check">
              <input name="emergency" type="checkbox" />
              Emergency assistance needed now
            </label>
            {!online && (
              <p className="form-note">
                Offline: this will be saved only on this device. Use direct
                communication for emergencies.
              </p>
            )}
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="button primary">
              {busy
                ? "Saving…"
                : online
                  ? "Create encounter & QR"
                  : "Save offline registration"}
            </button>
          </form>
        </Modal>
      )}
      {qr && (
        <Modal title="Encounter created" onClose={() => setQr(null)}>
          <QRToken {...qr} />
        </Modal>
      )}
    </>
  );
}
