# Photo card share links (ClaudeV21)

Cards without a photo already share as a link with a rendered preview. This
release adds an OPTIONAL way for cards that DO contain a personal photo to also
share as a link with a real preview of the finished card.

## How it works

When a photo card is shared and Cloudinary is configured, the browser uploads
the finished card image directly to Cloudinary (never to your own server), then
shares a c.php link that carries the hosted image. WhatsApp and other platforms
then show the real card as the preview.

The upload only happens after the user confirms a consent dialog stating they
are responsible for the content they create and that the link expires. If they
decline, or if Cloudinary is not configured, the card falls back to sharing the
image file directly exactly as before.

## Nothing touches your server

The photo goes from the user's browser straight to Cloudinary. Your Hostinger
server never receives or stores it. c.php only ever references the Cloudinary
URL, and it only accepts image URLs from res.cloudinary.com.

## Setup (optional, only if you want photo cards to share with a link)

1. Create a free Cloudinary account.
2. In Settings, create an UNSIGNED upload preset. Set it to auto-expire assets
   (for example after 30 days), cap the file size, and restrict to image
   formats. Note the preset name and your cloud name.
3. In app.html, add two attributes to the <html> element:

     <html lang="en-GB"
           data-site-domain="cardmakermessages.com"
           data-cloudinary-cloud="YOUR_CLOUD_NAME"
           data-cloudinary-preset="YOUR_UNSIGNED_PRESET">

That is all. With those two values present, photo cards offer the shareable
link. Without them, the feature stays dormant and nothing changes.

## Responsibility model

This follows the same approach as Canva and Adobe: users may create and share
freely, and are responsible for the content they make. The shared card page
shows a report address. Set that address to one you monitor by editing the
report line in c.php.
