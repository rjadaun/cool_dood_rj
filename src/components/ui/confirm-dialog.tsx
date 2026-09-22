"use client";

import * as React from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = React.useState(false);
  const resolver = React.useRef<(v: boolean) => void>(null);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    setState(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolver.current?.(result);
    setState(null);
    setLoading(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        open={!!state}
        onClose={() => close(false)}
        title={state?.title}
        description={state?.description}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => close(false)}>
              {state?.cancelText ?? "Cancel"}
            </Button>
            <Button
              variant={state?.danger ? "danger" : "primary"}
              loading={loading}
              onClick={() => {
                setLoading(true);
                close(true);
              }}
            >
              {state?.confirmText ?? "Confirm"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-stone-600">
          {state?.description ?? "This action cannot be undone."}
        </p>
      </Modal>
    </ConfirmContext.Provider>
  );
}
