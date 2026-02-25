import { cn } from "@/lib/cn";
import { CheckCircle, Clock, AlertTriangle, XCircle, Circle } from "lucide-react";

type StatusType = "pendente" | "pago" | "atrasado" | "cancelado" | "Aberta" | "Vencida" | "Paga" | "Cancelada" | string;

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<string, {
  label: string;
  className: string;
  icon: typeof Circle;
}> = {
  // Database status keys (lowercase)
  pendente: {
    label: "Aberta",
    className: "bg-info-bg text-blue-800 border-info-border",
    icon: Clock,
  },
  pago: {
    label: "Paga",
    className: "bg-success-bg text-green-800 border-success-border",
    icon: CheckCircle,
  },
  atrasado: {
    label: "Vencida",
    className: "bg-danger-bg text-red-800 border-danger-border",
    icon: AlertTriangle,
  },
  cancelado: {
    label: "Cancelada",
    className: "bg-neutral-bg text-neutral-text border-neutral-border",
    icon: XCircle,
  },
  // Portuguese display keys
  Aberta: {
    label: "Aberta",
    className: "bg-info-bg text-blue-800 border-info-border",
    icon: Clock,
  },
  Vencida: {
    label: "Vencida",
    className: "bg-danger-bg text-red-800 border-danger-border",
    icon: AlertTriangle,
  },
  Paga: {
    label: "Paga",
    className: "bg-success-bg text-green-800 border-success-border",
    icon: CheckCircle,
  },
  Cancelada: {
    label: "Cancelada",
    className: "bg-neutral-bg text-neutral-text border-neutral-border",
    icon: XCircle,
  },
};

const defaultConfig = {
  label: "Desconhecido",
  className: "bg-neutral-bg text-neutral-text border-neutral-border",
  icon: Circle,
};

export function StatusBadge({
  status,
  showIcon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || defaultConfig;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {config.label}
    </span>
  );
}

/** Map database status to display label */
export function getStatusLabel(status: string): string {
  return (statusConfig[status] ?? defaultConfig).label;
}

/** Get the CSS classes for a given status key */
export function getStatusClasses(status: string): string {
  return (statusConfig[status] ?? defaultConfig).className;
}

export const STATUS_CONFIG = statusConfig;
