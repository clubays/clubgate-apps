import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isSecureOrLocal } from "@/utils/device";
import { Camera, ShieldAlert, Lock, AlertTriangle } from "lucide-react";

interface PermissionGateProps {
  error: string | null;
  hasPermission: boolean | null;
  isLoading: boolean;
  onRetry: () => void;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  error,
  hasPermission,
  isLoading,
  onRetry,
  children,
}) => {
  const isSecure = isSecureOrLocal();

  if (!isSecure) {
    return (
      <Card withBrackets className="p-8 max-w-lg mx-auto text-center my-12">
        <div className="w-12 h-12 rounded-full bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-[var(--danger)] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-heading mb-2">
          Secure Origin Required
        </h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          Browser security policies require HTTPS or localhost for high-speed
          camera access. PaceLab operates purely on-device and never sends video
          over the network.
        </p>
        <div className="p-3 bg-[var(--surface-2)] rounded border border-[var(--line)] text-xs font-mono text-[var(--muted)]">
          Ensure you are accessing via HTTPS.
        </div>
      </Card>
    );
  }

  if (hasPermission === false || error) {
    return (
      <Card withBrackets className="p-8 max-w-lg mx-auto text-center my-12">
        <div className="w-12 h-12 rounded-full bg-[var(--warn)]/15 border border-[var(--warn)]/30 text-[var(--warn)] flex items-center justify-center mx-auto mb-4">
          {hasPermission === false ? (
            <ShieldAlert className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>
        <h2 className="text-xl font-bold font-heading mb-2">
          Camera Permission Needed
        </h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          {error ||
            "PaceLab needs access to your camera to detect ball motion and compute delivery speeds in real time on this device."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" onClick={onRetry} isLoading={isLoading}>
            <Camera className="w-4 h-4 mr-1.5" />
            Enable Camera
          </Button>
        </div>
        <div className="mt-6 text-xs text-[var(--muted)] border-t border-[var(--line)] pt-4">
          Tip: If you previously blocked the camera, click the camera or lock
          icon in your browser URL bar to reset permissions.
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};
