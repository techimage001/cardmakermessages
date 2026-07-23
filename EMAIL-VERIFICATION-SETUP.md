# Email verification setup

Card Maker Messages uses verified email access after three free exports. The verification flow keeps only lightweight, invisible abuse controls:

- hidden honeypot field
- minimum form-completion time
- IP-hash rate limiting
- email-format and mail-domain checks
- time-limited one-click verification link
- authenticated Hostinger SMTP
- verified session cookie only after the link is opened

## 1. Create the private folder

In Hostinger File Manager, open:

```text
domains/cardmakermessages.com/
```

Create this folder beside `public_html`:

```text
cmm_private
```

The result should be:

```text
domains/cardmakermessages.com/
    public_html/
    cmm_private/
```

## 2. Create secrets.php

Open `CMM-SECRETS-TEMPLATE.php` from this package. Copy it to:

```text
domains/cardmakermessages.com/cmm_private/secrets.php
```

Replace:

- `SITE_SALT` with a random string of at least 32 characters
- `smtp_pass` with the actual mailbox password for `info@cardmakermessages.com`

Leave the SMTP host as `smtp.hostinger.com`, port `465`, and the mailbox fields as `info@cardmakermessages.com` unless Hostinger shows different settings.

## 3. Folder permissions

The `cmm_private` folder must be writable by PHP because the verified-leads SQLite database is created there. The folder is outside `public_html`, so the database and password are not publicly downloadable and are not replaced by Git deployment.

## 4. Test the complete journey

1. Open `https://cardmakermessages.com/app.html` in a private browser window.
2. Create three exports.
3. On the fourth export, enter an email address.
4. Wait at least three seconds after the sign-up form opens before submitting.
5. Confirm the email arrives from Card Maker Messages.
6. Open the private verification link.
7. Confirm the browser returns to the card maker with unlimited access unlocked.
8. Confirm `info@cardmakermessages.com` receives the verified-signup notification.

## 5. Deliverability

In Hostinger, confirm SPF and DKIM are enabled for the domain. Add DMARC as well. The code sends through authenticated SMTP rather than relying on unauthenticated PHP `mail()`.

## Safety behaviour

If `secrets.php` is missing or incomplete, the public card maker continues to work for the first three exports, but verification links are not sent. The API returns a clear configuration message and never treats an unverified address as unlocked.
