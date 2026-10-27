// CloudFront Function (runtime cloudfront-js-2.0, viewer-request event) attached to the
// geocode-imagery/* cache behavior. Keeps other websites from using the tiles; see "Protecting the
// tiles" in ../README.md. Deployed by ../protect_tiles.py, tested against protect-tiles-cases.json.
//
// Browsers set Sec-Fetch-* and Referer themselves and page scripts cannot change them, so this
// stops other sites from embedding the tiles. It does not stop a determined scraper, which can
// send any headers it likes.

const ALLOWED_REFERER = /^https?:\/\/(([a-z0-9-]+\.)*concord\.org|localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i;

// CloudFront calls handler() by name.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(event) {
  const request = event.request;
  const headers = request.headers;
  const site = headerValue(headers, 'sec-fetch-site');
  const mode = headerValue(headers, 'sec-fetch-mode');
  const dest = headerValue(headers, 'sec-fetch-dest');
  const referer = headerValue(headers, 'referer');

  // Someone opened a tile in a tab: typed, bookmarked, or clicked a link. Only top-level
  // documents, so another site cannot show the tiles in iframes.
  if (mode === 'navigate' && dest === 'document') return request;
  if (site === 'same-origin' || site === 'same-site' || site === 'none') return request;

  // Cross-site requests (localhost development) and browsers that send no Sec-Fetch-Site (older
  // Safari, or plain http, where browsers omit it) must name an allowed page. A request with
  // neither header is a script, not a browser.
  return (referer && ALLOWED_REFERER.test(referer)) ? request : forbidden();
}

function headerValue(headers, name) {
  return headers[name] && headers[name].value;
}

function forbidden() {
  return { statusCode: 403, statusDescription: 'Forbidden' };
}
