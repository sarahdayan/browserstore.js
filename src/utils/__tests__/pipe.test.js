import pipe from '../pipe'

describe('pipe', () => {
  test('pipes functions and return result', () => {
    const increment = a => a + 1
    const double = a => a * 2
    const f = pipe(
      increment,
      double
    )

    expect(f(3)).toBe(8)
  })
})
