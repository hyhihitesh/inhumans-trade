/**
 * Lightweight logger for Inhumans.io
 * Provides consistent formatting and environment-aware log levels.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private format(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const ctxString = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${ctxString}`;
  }

  info(message: string, context?: any) {
    console.log(this.format("info", message, context));
  }

  warn(message: string, context?: any) {
    console.warn(this.format("warn", message, context));
  }

  error(message: string, context?: any) {
    console.error(this.format("error", message, context));
  }

  debug(message: string, context?: any) {
    if (this.isDev) {
      console.debug(this.format("debug", message, context));
    }
  }
}

export const logger = new Logger();
