# Vasutraders Website Refresh

This repository contains a modernized static landing page for Vasutraders, focused on:

- clearer value proposition and calls to action
- mobile-friendly responsive layout
- improved accessibility basics (skip link, semantic sections, labels)
- cleaner contact interaction with lightweight client-side validation

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish (GitHub Pages)

This repo includes an automated Pages workflow at `.github/workflows/deploy-pages.yml`.

1. Push this repository to GitHub.
2. In GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or `work`) to trigger deployment.
4. The site URL is shown in the workflow run summary.

### Custom domain (vasutraders.com)

To publish on your domain:

1. In **Settings → Pages**, set the custom domain to `vasutraders.com`.
2. Add DNS records at your domain registrar per GitHub Pages docs (A records + optional `www` CNAME).
3. Enable HTTPS in the same Pages settings panel after DNS propagation.
