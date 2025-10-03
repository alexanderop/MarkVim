/**
 * Result type for explicit error handling (Rust-inspired)
 * Forces errors to be part of the type system instead of runtime exceptions
 */

export type Result<T, E = Error>
  = { ok: true, value: T }
    | { ok: false, error: E }

/**
 * Create a successful Result
 */
export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

/**
 * Create a failed Result
 */
export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

/**
 * Unwrap a Result value, throwing if it's an error
 * Use sparingly - prefer pattern matching with if/switch
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(`Called unwrap on an Err value: ${String(result.error)}`)
  }
  return result.value
}

/**
 * Unwrap a Result value or return a default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue
}

/**
 * Map a Result's success value
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? Ok(fn(result.value)) : result
}

/**
 * Map a Result's error value
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return result.ok ? result : Err(fn(result.error))
}

/**
 * Chain Results (flatMap)
 */
export function andThen<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  return result.ok ? fn(result.value) : result
}

/**
 * Wrap a function that may throw into a Result-returning function
 */
export function tryCatch<T, E = Error>(fn: () => T, mapError?: (error: unknown) => E): Result<T, E> {
  try {
    return Ok(fn())
  }
  catch (error) {
    // eslint-disable-next-line ts/consistent-type-assertions
    const mappedError = mapError ? mapError(error) : error as E
    return Err(mappedError)
  }
}

/**
 * Wrap an async function that may throw into a Result-returning async function
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  mapError?: (error: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const value = await fn()
    return Ok(value)
  }
  catch (error) {
    // eslint-disable-next-line ts/consistent-type-assertions
    const mappedError = mapError ? mapError(error) : error as E
    return Err(mappedError)
  }
}
