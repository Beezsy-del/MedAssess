"use client";
import type { Category } from "@/features/clinical/engine";
import { X, Inbox } from "lucide-react";
import { useEffect, useRef } from "react";
export function Badge({ category }: { category: Category }) {
  return (
    <span className={`badge ${category.toLowerCase()}`}>
      <span aria-hidden="true" />
      {category === "ASSESSMENT_REQUIRED"
        ? "Assessment required"
        : category === "RED"
          ? "Red · Critical"
          : category === "YELLOW"
            ? "Yellow · Urgent"
            : "Green · Non-immediate"}
    </span>
  );
}
export function Status({ value }: { value: string }) {
  return (
    <span className="status">{value.toLowerCase().replaceAll("_", " ")}</span>
  );
}
export function Empty({
  title = "Nothing here yet",
  description = "New records will appear here as your team works.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty">
      <Inbox size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export function SectionTitle({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} className="modal" aria-label={title}>
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function time(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
export function minutes(value: string, now: string) {
  return Math.max(0, Math.floor((Date.parse(now) - Date.parse(value)) / 60000));
}
