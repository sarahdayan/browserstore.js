/**
 * Performs left-to-right function composition.
 *
 * @param {function} fns - The unary functions to execute.
 *
 * @example
 * // returns 8
 * const increment = a => a + 1
 * const double = a => a * 2
 * const f = pipe(increment, double)
 * f(3)
 * @example
 * // returns 10
 * const add = a => b => a + b
 * const double = a => a * 2
 * const f = pipe(add(2), double)
 * f(3)
 *
 * @return {}
 */
export default (...fns) => x => fns.reduce((v, f) => f(v), x)
