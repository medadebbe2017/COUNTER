# Counter

A tax and payment calculator built for businesses without a POS system.

_Originally created in 2022._

**Live demo:cntrapp.com

## The problem

Rivington Deli didn't have a point-of-sale system. Every sale meant a cashier calculating sales tax by hand — and remembering which items were even taxable in the first place (prepared deli food, detergent, and drinks all follow different NY tax rules). Mistakes were common, and there was no way to send a customer or a delivery driver a real receipt.

Counter was built to fix that, without requiring the business to buy or set up an actual POS system.

## What it does

- Calculates sales tax automatically based on item category (taxable vs. exempt)
- Adds a card payment surcharge only when the customer pays by card
- Supports custom item names and per-item special instructions (e.g. "no onions, extra sauce")
- Supports quantity, so multi-unit orders total correctly
- Tracks pickup vs. delivery orders, including a full delivery address
- Marks orders as "pay on delivery" when the customer hasn't paid yet
- Generates a live, itemized receipt as the order is built
- Sends the receipt to a customer or delivery driver via a shareable link (by text or email) — they open it and see a formatted receipt on their own phone
- Lets any business customize their own name, address, and phone number, so the tool isn't hardcoded to one store
- Installable to a phone's home screen, so it opens and feels like a real app

## How the receipt-sharing works

Rather than requiring a server, database, or paid SMS/email API, Counter encodes the entire order directly into the URL it generates. When the recipient opens the link, a second page (`receipt.html`) decodes that data straight out of the URL and renders the receipt — no backend, no stored data, no third-party service involved. This keeps the whole project fully static and privacy-friendly: nothing about a given order is stored anywhere except in the link itself.

## Tech stack

- **Web app:** HTML, CSS, and vanilla JavaScript (no frameworks)
- **CLI version:** Python (`counter_cli.py`), mirroring the same tax logic for use in a terminal
- No backend, no database, no build tools — genuinely static files that can run by just opening `index.html`

## Project structure

```
counter/
├── index.html          # main calculator app
├── receipt.html         # renders a shared receipt from a link
├── style.css
├── script.js             # calculator logic
├── receipt-view.js       # decodes and displays a shared receipt
├── counter_cli.py        # Python terminal version
├── manifest.json         # home screen / app install config
└── icons/                # app icons
```

## Running it locally

No build step required — just open `index.html` in a browser, or serve the folder with any local static server (e.g. VS Code's Live Server extension).

For the Python version:

```
python3 counter_cli.py
```

## Author

Built by Mohamed Adebba.

## License

All Rights Reserved. This code is shared publicly for portfolio and demonstration purposes only — see [LICENSE](LICENSE) for details. It is not open source and may not be copied, modified, or reused without permission.
