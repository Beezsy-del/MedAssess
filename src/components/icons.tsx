import type { SVGProps } from "react";

export interface ClinicalIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const baseProps = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true as const,
  className: className ? `mc-icon ${className}` : "mc-icon",
});

/** Bespoke geometric MediRoute emblem: concentric cipher dial + central clinical cross. */
export function MediRouteLogo({
  size = 24,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className ? `mc-logo-svg ${className}` : "mc-logo-svg"}
      {...rest}
    >
      {/* Outer ring: 4 cardinal-split quadrants alternating burgundy and crimson */}
      <path
        d="M53.62 8.66 A41.5 41.5 0 0 1 91.34 46.38"
        stroke="#D92B22"
        strokeWidth="6.4"
      />
      <path
        d="M91.34 53.62 A41.5 41.5 0 0 1 53.62 91.34"
        stroke="#7E122F"
        strokeWidth="6.4"
      />
      <path
        d="M46.38 91.34 A41.5 41.5 0 0 1 8.66 53.62"
        stroke="#D92B22"
        strokeWidth="6.4"
      />
      <path
        d="M8.66 46.38 A41.5 41.5 0 0 1 46.38 8.66"
        stroke="#7E122F"
        strokeWidth="6.4"
      />

      {/* Middle ring: diagonal-split arcs */}
      <path
        d="M30.74 24.44 A32 32 0 0 1 69.26 24.44"
        stroke="#7E122F"
        strokeWidth="6"
      />
      <path
        d="M75.56 30.74 A32 32 0 0 1 75.56 69.26"
        stroke="#7E122F"
        strokeWidth="6"
      />
      <path
        d="M69.26 75.56 A32 32 0 0 1 30.74 75.56"
        stroke="#7E122F"
        strokeWidth="6"
      />
      <path
        d="M24.44 69.26 A32 32 0 0 1 24.44 30.74"
        stroke="#D92B22"
        strokeWidth="6"
      />

      {/* Inner crimson ring with dark burgundy cardinal ticks & diagonal bridges */}
      <circle cx="50" cy="50" r="22.8" stroke="#D92B22" strokeWidth="5.4" />
      <path
        d="M47.22 27.37 A22.8 22.8 0 0 1 52.78 27.37 M72.63 47.22 A22.8 22.8 0 0 1 72.63 52.78 M52.78 72.63 A22.8 22.8 0 0 1 47.22 72.63 M27.37 52.78 A22.8 22.8 0 0 1 27.37 47.22"
        stroke="#651226"
        strokeWidth="5.6"
      />
      <path
        d="M66.1 33.9 L74 26 M66.1 66.1 L74 74 M33.9 66.1 L26 74 M33.9 33.9 L26 26"
        stroke="#D92B22"
        strokeWidth="5.2"
        strokeLinecap="butt"
      />

      {/* Center burgundy disc and medical cross */}
      <circle cx="50" cy="50" r="19.5" fill="#7E122F" />
      <path
        d="M45.2 36.8 H54.8 V45.2 H63.2 V54.8 H54.8 V63.2 H45.2 V54.8 H36.8 V45.2 H45.2 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/** Command track-board pulse icon for Overview */
export function OverviewPulseIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <rect
        x="3"
        y="3.5"
        width="18"
        height="17"
        rx="4"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M7 9.5H10.5M7 13.5H17M7 17H13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="16.5" cy="8.5" r="2.2" fill="var(--brand-gold, #A38143)" />
    </svg>
  );
}

/** Patient registration & QR intake pass icon */
export function PatientIntakeIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <rect
        x="4.5"
        y="4"
        width="15"
        height="17"
        rx="3"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M9 4V2.8C9 2.36 9.36 2 9.8 2H14.2C14.64 2 15 2.36 15 2.8V4"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M12 9.5V15.5M9 12.5H15"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Reception check-in & encounter desk icon */
export function ReceptionDeskIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <circle
        cx="9"
        cy="8"
        r="3"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3.5 19.5C3.8 16.5 6.1 14.5 9 14.5C11.9 14.5 14.2 16.5 14.5 19.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16.5 8.5V13.5M14 11H19"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Triage acuity shield with 3 stacked urgency bars */
export function AcuityShieldIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M12 2.75L19.5 5.6V11.8C19.5 16.6 16.3 20.1 12 21.5C7.7 20.1 4.5 16.6 4.5 11.8V5.6L12 2.75Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 9.2H15.5M9.5 12.5H14.5M10.8 15.8H13.2"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Doctor / clinician assessment stethoscope icon */
export function StethoscopeCrossIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M6.5 3.5V9C6.5 12 8.7 14.2 11.5 14.2C14.3 14.2 16.5 12 16.5 9V3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M5.5 3.5H7.5M15.5 3.5H17.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M11.5 14.2V16.8C11.5 19.1 13.3 20.8 15.6 20.8C17.9 20.8 19.5 19.2 19.5 17V13.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle
        cx="19.5"
        cy="11.5"
        r="2.2"
        fill="var(--brand-gold, #A38143)"
        fillOpacity="0.28"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="1.75"
      />
    </svg>
  );
}

/** Emergency beacon & rapid pulse monitor */
export function EmergencyBeaconIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M12 3.2L20.5 18.5C20.9 19.2 20.4 20 19.6 20H4.4C3.6 20 3.1 19.2 3.5 18.5L12 3.2Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.2V13.5"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.8" r="1.1" fill="var(--brand-gold, #A38143)" />
    </svg>
  );
}

/** SmartFlow multi-stage patient journey node map */
export function FlowJunctionIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <circle
        cx="5.5"
        cy="6.5"
        r="2.5"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle
        cx="18.5"
        cy="12"
        r="2.5"
        fill="var(--brand-gold, #A38143)"
        fillOpacity="0.28"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="1.75"
      />
      <circle
        cx="5.5"
        cy="17.5"
        r="2.5"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8 6.5H11.5C13.2 6.5 13.8 12 16 12M8 17.5H11.5C13.2 17.5 13.8 12 16 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Hospital bed & ward bay monitor icon */
export function BedBayIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M3.5 18.5V7.5M20.5 18.5V12.5C20.5 10.8 19.2 9.5 17.5 9.5H10.5V15M3.5 15H20.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="5.5"
        y="10.2"
        width="3.5"
        height="2.8"
        rx="1.2"
        fill="var(--brand-gold, #A38143)"
        fillOpacity="0.45"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/** Hospital wing & clinical department building icon */
export function DepartmentUnitIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M4.5 20V5.5C4.5 4.4 5.4 3.5 6.5 3.5H17.5C18.6 3.5 19.5 4.4 19.5 5.5V20M3 20H21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 7.5V12.5M9.5 10H14.5"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <path
        d="M10 20V16.2C10 15.5 10.5 15 11.2 15H12.8C13.5 15 14 15.5 14 16.2V20"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Inter-department / inter-hospital referral handover icon */
export function ReferralTransferIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M4.5 8.5H17.5L14 5M19.5 15.5H6.5L10 19"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="8.5" r="1.8" fill="var(--brand-gold, #A38143)" />
    </svg>
  );
}

/** Capacity forecasting & pulse analytics icon */
export function AnalyticsTrendIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M4 19.5H20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <rect
        x="5.5"
        y="12"
        width="3"
        height="5"
        rx="1"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <rect
        x="10.5"
        y="9"
        width="3"
        height="8"
        rx="1"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <rect
        x="15.5"
        y="5.5"
        width="3"
        height="11.5"
        rx="1"
        fill="var(--brand-gold, #A38143)"
        fillOpacity="0.7"
      />
      <path
        d="M5 9.5L10.5 6.5L14.5 8L19.5 3.8"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Immutable audit governance seal */
export function AuditSealIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M12 2.8L19.2 5.4V11.6C19.2 16.4 16.1 19.9 12 21.3C7.9 19.9 4.8 16.4 4.8 11.6V5.4L12 2.8Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 12.2L11 14.4L15.4 9.8"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Live vitals waveform monitor badge */
export function VitalsMonitorIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <rect
        x="3"
        y="4.5"
        width="18"
        height="13"
        rx="3"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M5.5 11.2H8.5L10.2 7.5L12.6 14.5L14.6 10.2L15.8 11.2H18.5"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 20.5H15.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Patient self-intake portal & QR cipher frame icon */
export function PatientPortalIcon({
  size = 18,
  className,
  ...rest
}: ClinicalIconProps) {
  return (
    <svg {...baseProps(size, className)} {...rest}>
      <path
        d="M4 8V5.5C4 4.67 4.67 4 5.5 4H8M16 4H18.5C19.33 4 20 4.67 20 5.5V8M20 16V18.5C20 19.33 19.33 20 18.5 20H16M8 20H5.5C4.67 20 4 19.33 4 18.5V16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="10"
        r="2.4"
        fill="var(--brand-gold, #A38143)"
        fillOpacity="0.35"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7.8 16.8C8.4 14.8 10 13.8 12 13.8C14 13.8 15.6 14.8 16.2 16.8"
        stroke="var(--brand-gold, #A38143)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
