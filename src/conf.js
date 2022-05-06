const dev = true

export const conf = {
  loc: !dev
    ? window.location.origin + window.location.pathname
    : 'http://localhost',
  dev,
}
