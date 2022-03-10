
const isPromise = <T = any>(promise: any): promise is Promise<T> => promise.constructor.name === 'Promise'

type Error = {
  type: 'error';
  error: any;
};

type Success<R> = {
  type: 'success';
  data: R;
};

type GoResponse<R> = Error | Success<R>;


type GoFunc<R> = () => R
type GoPromise<R> = Promise<R>

export function go<R = any>(func: GoFunc<R>): Promise<GoResponse<R>>;
export async function go<R = any>(promise: GoPromise<R>): Promise<GoResponse<R>>;

/**
 * No more try catch blocks
 *
 * Inspired by {@link [Golang's error handling](https://gabrieltanner.org/blog/golang-error-handling-definitive-guide)}
 * but using typescript's {@link [narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)}
 * to provide a type-safe DX.
 *
 * @example
 * const response = go(fetch(`api/user/${id}`))
 * if (response.type === 'error') {
 *  console.error(response.error)
 *  return; // or throw (required)
 * }
 * console.log(response.data) // No type-error claiming that data might be null
 */
export default async function go<R = any>(promise: GoFunc<R> | GoPromise<R>): Promise<GoResponse<R>> {
  // If a promise was passed
  if (isPromise<R>(promise)) {
    try {
      const data = await promise;
      return { type: 'success', data };
    } catch (error) {
      return { type: 'error', error };
    }
  }
  // If a non async function was executed as go's first param
  try {
    return { type: 'success', data: promise() };
  } catch (error) {
    return { type: 'error', error };
  }
}
