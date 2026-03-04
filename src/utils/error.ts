import type { AxiosError } from "axios";
import { capitalize } from "./strings";

type APIErrorResponse = {
  message: string;
  data?: unknown;
};

const defaultError = "Unable to process your request right now";

function isAxiosError<T = unknown>(error: unknown): error is AxiosError<T> {
  return (error as AxiosError<T>)?.isAxiosError === true;
}

export const errorTransformer = (error: unknown): string => {
  // Handle Axios error first
  if (isAxiosError<APIErrorResponse>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      error.response?.statusText ||
      defaultError
    );
  }

  // Handle Stax-specific error with "code", "message", "fieldErrors"
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "fieldErrors" in error
  ) {
    const e = error as {
      code: string;
      message: string;
      fieldErrors?: { field: string; message: string }[];
    };

    // Prefer fieldErrors if present
    if (Array.isArray(e.fieldErrors) && e.fieldErrors.length > 0) {
      return e.fieldErrors.map((f) => capitalize(`${f.message}`)).join(" | ");
    }

    return e.message || defaultError;
  }

  // Generic JS Error fallback
  if (error instanceof Error) {
    return error.message || defaultError;
  }

  return defaultError;
};
