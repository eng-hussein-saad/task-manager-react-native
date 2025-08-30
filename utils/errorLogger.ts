type Severity = 'info' | 'warning' | 'error' | 'fatal';

export interface ErrorLoggerOptions {
  endpoint?: string; // e.g., your API to receive logs
  appVersion?: string;
  environment?: string; // 'development' | 'production' etc.
  onLog?: (payload: ErrorLogPayload) => void; // hook to integrate with a service (Sentry, etc.)
  extras?: Record<string, unknown>;
}

export interface ErrorLogPayload {
  name: string;
  message: string;
  stack?: string;
  severity: Severity;
  isUnhandled?: boolean;
  source: 'web' | 'native' | 'unknown';
  timestamp: string;
  appVersion?: string;
  environment?: string;
  extras?: Record<string, unknown>;
}

const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

function toPayload(
  error: unknown,
  severity: Severity,
  source: ErrorLogPayload['source'],
  opts?: ErrorLoggerOptions,
  isUnhandled?: boolean,
  extras?: Record<string, unknown>
): ErrorLogPayload {
  const err = normalizeError(error);
  return {
    name: err.name || 'Error',
    message: err.message || String(error),
    stack: err.stack,
    severity,
    isUnhandled,
    source,
    timestamp: new Date().toISOString(),
    appVersion: opts?.appVersion,
    environment: opts?.environment,
    extras: { ...opts?.extras, ...extras },
  };
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

async function dispatch(payload: ErrorLogPayload, opts?: ErrorLoggerOptions) {
  try {
    if (opts?.onLog) opts.onLog(payload);
    if (opts?.endpoint) {
      await fetch(opts.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      if (__DEV__) {
        // Avoid double-spam in dev
        // eslint-disable-next-line no-console
        console.error('[ErrorLogger]', payload);
      }
    }
  } catch {
    // Swallow logging errors
  }
}

export function captureException(
  error: unknown,
  extras?: Record<string, unknown>,
  opts?: ErrorLoggerOptions
) {
  const source: ErrorLogPayload['source'] = isWeb ? 'web' : 'native';
  const payload = toPayload(error, 'error', source, opts, false, extras);
  void dispatch(payload, opts);
}

export function captureMessage(
  message: string,
  severity: Severity = 'info',
  extras?: Record<string, unknown>,
  opts?: ErrorLoggerOptions
) {
  const source: ErrorLogPayload['source'] = isWeb ? 'web' : 'native';
  const payload = toPayload(new Error(message), severity, source, opts, false, extras);
  void dispatch(payload, opts);
}

/**
 * Sets up global handlers for unhandled errors and promise rejections.
 * Returns a cleanup function.
 */
export function setupErrorLogging(opts?: ErrorLoggerOptions) {
  const cleanups: Array<() => void> = [];

  if (isWeb) {
    const onError = (event: ErrorEvent) => {
      const payload = toPayload(event.error || event.message, 'fatal', 'web', opts, true, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
      void dispatch(payload, opts);
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const payload = toPayload(event.reason, 'fatal', 'web', opts, true);
      void dispatch(payload, opts);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    cleanups.push(() => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    });
  } else {
    // React Native global handler
    const g: any = globalThis as any;
    const prevHandler = g.ErrorUtils?.getGlobalHandler?.() ?? g.ErrorUtils?._globalHandler;
    const handler = (error: any, isFatal?: boolean) => {
      const payload = toPayload(error, isFatal ? 'fatal' : 'error', 'native', opts, true);
      void dispatch(payload, opts);
      if (typeof prevHandler === 'function') {
        try {
          prevHandler(error, isFatal);
        } catch {
          // ignore
        }
      }
    };
    try {
      g.ErrorUtils?.setGlobalHandler?.(handler);
      cleanups.push(() => {
        if (g.ErrorUtils && typeof prevHandler === 'function') {
          g.ErrorUtils.setGlobalHandler(prevHandler);
        }
      });
    } catch {
      // ignore if not available
    }
  }

  return () => cleanups.forEach((c) => c());
}