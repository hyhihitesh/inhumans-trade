import { logger } from "./logger";

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 500,
  maxDelay: 5000,
  shouldRetry: (error: any) => {
    // Retry on common transient errors (network, 429, 503, etc.)
    const status = error?.status || error?.code;
    return (
      !status || // Network error
      status === 429 || // Too Many Requests
      status === 502 || // Bad Gateway
      status === 503 || // Service Unavailable
      status === 504 || // Gateway Timeout
      status === "PGRST301" // Supabase/PostgREST too many connections
    );
  },
};

/**
 * Wraps an async function with exponential backoff retry logic.
 * Ideal for repository calls and external API integrations.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, shouldRetry } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && shouldRetry(error)) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        logger.warn(`API request failed, retrying in ${delay}ms...`, {
          attempt: attempt + 1,
          error: error instanceof Error ? error.message : String(error),
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  throw lastError;
}

/**
 * Adds a unique request correlation ID for tracing.
 */
export function getCorrelationHeaders() {
  return {
    "X-Correlation-ID": crypto.randomUUID(),
    "X-Request-Source": "inhumans-app",
  };
}
