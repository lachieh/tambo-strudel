"use client";

import { useLoadingContext } from "@/components/loading/context";
import { StrudelService } from "@/strudel/lib/service";
import { StrudelReplState } from "@strudel/codemirror";
import * as React from "react";

type StrudelContextValue = {
  // Define context value types here
  code: string,
  setCode: (code: string, shouldEvaluate: boolean) => void,
  errors: string[],
  setError: (error: string | null) => void,
  clearErrors: () => void,
  isPlaying: boolean,
  play: () => void,
  stop: () => void,
  reset: () => void,
  setRoot: (el: HTMLDivElement) => void
  getThreadId: () => string | null,
  setThreadId: (threadId: string) => void,
  isReady: boolean,
};

export const StrudelContext = React.createContext<StrudelContextValue | null>(null);

const strudelService = StrudelService.instance();

export function StrudelProvider({ children }: { children: React.ReactNode }) {
  const { state, setMessage, setProgress, setState } = useLoadingContext();
  const [errors, setErrors] = React.useState<string[]>([]);
  const [replState, setReplState] = React.useState<StrudelReplState | null>(() => {
    return strudelService.getReplState();
  });

  React.useEffect(() => {
    const loadingUnsubscribe = strudelService.onLoadingProgress(
      (status: string, progress: number) => {
        setProgress(progress);
        setMessage(status || "Loading...");

        if (progress >= 100) {
          setState("ready");
        }
      }
    );

    const replUnsubscribe = strudelService.onStateChange((newState) => {
      setReplState((state) => {
        if (!state?.evalError) {
          setErrors([]);
        }
        return { ...state, ...newState }
      });
    });

    if (!strudelService.isReady) {
      strudelService.init();
      return;
    }

    return () => {
      loadingUnsubscribe();
      replUnsubscribe();
    };
  }, [setMessage, setProgress, setReplState, setState]);

  React.useEffect(() => {
    return strudelService.onReplError((error: Error) => {
      setErrors((prev) => [...prev, error.message]);
    });
  }, []);

  const setRoot = React.useCallback((el: HTMLDivElement) => {
    strudelService.attach(el);

    return () => {
      strudelService.detach();
    };
  }, []);

  const providerValue: StrudelContextValue = React.useMemo(() => {
    const { started: isPlaying, code } = replState || { started: false, code: '' };
    return {
      code,
      isPlaying,
      errors,
      setError: (error: string | null) => {
        if (error) {
          setErrors((prev) => [...prev, error]);
        }
      },
      clearErrors: () => {
        setErrors([]);
      },
      state,
      setCode: strudelService.setCode,
      play: async () => await strudelService.play,
      stop: strudelService.stop,
      reset: strudelService.reset,
      setRoot,
      getThreadId: strudelService.getThreadId,
      setThreadId: strudelService.setThreadId,
      isReady: strudelService.isReady,
    }
  }, [setRoot, replState, state, errors]);

  return (
    <StrudelContext.Provider value={providerValue}>{children}</StrudelContext.Provider>
  );
}

export function useStrudel() {
  // Hook implementation
  const context = React.useContext(StrudelContext);

  if (!context) {
    throw new Error('useStrudel must be used within a StrudelProvider');
  }

  return context;
}
