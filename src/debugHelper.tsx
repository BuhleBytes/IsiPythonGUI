// debugHelper.tsx

// Base URL constant
const API_BASE_URL = "https://isipython-dev.onrender.com";

export interface DebugStartRequest {
  code: string;
}

export interface DebugStepRequest {
  session_id: string;
  input?: string;
}

export interface DebugResponse {
  session_id: string;
  waiting_for_debug_step: boolean;
  waiting_for_input: boolean;
  current_line: number;
  variables: Record<string, any>;
  output: string;
  completed: boolean;
  prompt?: string; // Only present when waiting_for_input is true
}

export interface DebugErrorResponse {
  error: string;
  completed: true;
  output: string;
}

export type DebugApiResponse = DebugResponse | DebugErrorResponse;

// Type guards to check response types
export const isDebugError = (
  response: DebugApiResponse
): response is DebugErrorResponse => {
  return "error" in response;
};

export const isWaitingForInput = (response: DebugResponse): boolean => {
  return response.waiting_for_input === true;
};

export const isWaitingForStep = (response: DebugResponse): boolean => {
  return response.waiting_for_debug_step === true;
};

export const isCompleted = (response: DebugApiResponse): boolean => {
  return response.completed === true;
};

// API Functions
export class DebugHelper {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Starts a new debugging session
   * @param code - The isiXhosa source code to debug
   * @returns Promise with the initial debug state
   */
  async startDebugSession(code: string): Promise<DebugApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/debug/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DebugApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error starting debug session:", error);
      throw error;
    }
  }

  /**
   * Steps through the debugging session
   * @param sessionId - The debug session identifier
   * @param input - Optional user input (only provide when waiting_for_input is true)
   * @returns Promise with the updated debug state
   */
  async stepDebug(
    sessionId: string,
    input?: string
  ): Promise<DebugApiResponse> {
    try {
      const requestBody: DebugStepRequest = { session_id: sessionId };

      // Only include input if it's provided
      if (input !== undefined) {
        requestBody.input = input;
      }

      const response = await fetch(`${this.baseUrl}/api/debug/step`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DebugApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error stepping debug session:", error);
      throw error;
    }
  }

  /**
   * Steps through debugging without providing input
   * @param sessionId - The debug session identifier
   * @returns Promise with the updated debug state
   */
  async stepOnly(sessionId: string): Promise<DebugApiResponse> {
    return this.stepDebug(sessionId);
  }

  /**
   * Provides input to a debugging session that's waiting for user input
   * @param sessionId - The debug session identifier
   * @param input - The user input to provide
   * @returns Promise with the updated debug state
   */
  async provideInput(
    sessionId: string,
    input: string
  ): Promise<DebugApiResponse> {
    return this.stepDebug(sessionId, input);
  }
}

// Create a default instance with the constant base URL
export const debugHelper = new DebugHelper();

// Hook for React components (optional)
import { useCallback, useState } from "react";

export interface UseDebugSessionReturn {
  debugState: DebugResponse | null;
  error: string | null;
  isLoading: boolean;
  startSession: (code: string) => Promise<void>;
  step: () => Promise<void>;
  provideInput: (input: string) => Promise<void>;
  reset: () => void;
}

export const useDebugSession = (baseUrl?: string): UseDebugSessionReturn => {
  const [debugState, setDebugState] = useState<DebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use the provided baseUrl or fall back to the constant
  const helper = new DebugHelper(baseUrl || API_BASE_URL);

  const startSession = useCallback(
    async (code: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await helper.startDebugSession(code);

        if (isDebugError(response)) {
          setError(response.error);
          setDebugState(null);
        } else {
          setDebugState(response);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setDebugState(null);
      } finally {
        setIsLoading(false);
      }
    },
    [helper]
  );

  const step = useCallback(async () => {
    if (!debugState?.session_id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await helper.stepOnly(debugState.session_id);

      if (isDebugError(response)) {
        setError(response.error);
      } else {
        setDebugState(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [debugState?.session_id, helper]);

  const provideInput = useCallback(
    async (input: string) => {
      if (!debugState?.session_id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await helper.provideInput(
          debugState.session_id,
          input
        );

        if (isDebugError(response)) {
          setError(response.error);
        } else {
          setDebugState(response);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [debugState?.session_id, helper]
  );

  const reset = useCallback(() => {
    setDebugState(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    debugState,
    error,
    isLoading,
    startSession,
    step,
    provideInput,
    reset,
  };
};
