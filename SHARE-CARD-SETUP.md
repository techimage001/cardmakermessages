# Shareable card links (ClaudeV20)

This release adds automatic image-plus-link sharing to WhatsApp and other
platforms, using a stateless hosted preview. No uploads, no storage, no user
photos ever reach the server.

## How it works

When a card has no personal photo, the Share button now shares a URL:

    https://cardmakermessages.com/c.php?o=anniversary&t=royal&h=Happy+Anniversary&m=...

- WhatsApp and other platforms fetch that page, read its Open Graph tags, and
  show a card preview thumbnail with the link as the message.
- A human who opens the link sees the card redrawn from the parameters, plus a
  "Make your own free card" button that deep-links into the app for that
  occasion.
- The preview image itself is rendered on the fly by `api/og.php` from the same
  parameters. It shows the design, occasion and message only. It never shows the
  personal photo.

When a card DOES have a personal photo, the Share button keeps the previous
behaviour and shares the finished image file directly, because the server has no
copy of the photo and must not.

## Files added

- `c.php` — the share landing page. Serves OG tags to crawlers and a redrawn
  card to humans. Marked `noindex, nofollow`; not added to the sitemap.
- `api/og.php` — the Open Graph image renderer. Uses PHP GD. Renders a
  photo-free 1200x630 PNG and caches it to the system temp directory for one
  day, keyed by a hash of the parameters.

## Server requirement: PHP GD

`api/og.php` needs the PHP GD extension, which is enabled by default on almost
all Hostinger PHP plans. If GD is not available, the renderer fails safe: it
redirects to the existing static image at `/assets/og-image.png`, so shared
links still show a branded preview and nothing breaks.

To confirm GD is present, you can create a temporary file with:

    <?php var_dump(function_exists('imagecreatetruecolor'));

Load it once in a browser, confirm it prints `bool(true)`, then delete it.

## Nothing stored

- No database rows, no uploaded files, no card records.
- The temp cache holds only rendered preview PNGs, auto-expiring after a day.
- Because the shared card lives entirely in its URL, there is nothing to delete
  and no directory to browse.

## Privacy

- Personal photos never leave the browser.
- Shared previews are photo-free by design.
- Card pages are noindex and excluded from the sitemap, so shared cards do not
  appear in search results.

## Abuse surface

Minimal. The endpoints are stateless and accept no uploads. `og.php` only ever
draws text and shapes from a fixed palette, capped in length, with control
characters and tags stripped. There is no file write except the server's own
temp cache.
