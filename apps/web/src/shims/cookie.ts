// Ensure named exports parse/serialize are available via CJS entry
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error CJS import
import cookieCjs from 'cookie/index.js'

const { parse, serialize } = (cookieCjs as any) ?? {}

export { parse, serialize }


