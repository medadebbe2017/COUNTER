"""
Counter — Deli Tax Calculator (CLI version)
--------------------------------------------
Category-based tax logic, plus a card payment surcharge — so nobody
has to memorize which items are taxable or run the math by hand.
Enter a price, pick a category, then pick a payment method.
Type 'done' to stop.
"""

TAX_RATE = 0.08875        # NYC sales tax rate
CARD_SURCHARGE_RATE = 0.04  # applied only when paying by card

# Define your categories here. True = taxable, False = tax-exempt.
CATEGORIES = {
    "1": ("Deli Food", True),
    "2": ("Detergent", True),
    "3": ("Grocery Food", False),
    "4": ("Beverages", False),
    "5": ("Other (Taxable)", True),
    "6": ("Other (Non-Taxable)", False),
}

PAY_METHODS = {
    "1": "Cash",
    "2": "Card",
}


def calculate_total(price, taxable, pay_method):
    tax = price * TAX_RATE if taxable else 0.0
    surcharge = (price + tax) * CARD_SURCHARGE_RATE if pay_method == "Card" else 0.0
    total = price + tax + surcharge
    return tax, surcharge, total


def print_categories():
    print("Categories:")
    for key, (name, taxable) in CATEGORIES.items():
        label = "taxable" if taxable else "exempt"
        print(f"  {key}. {name} ({label})")


def print_pay_methods():
    print("Payment method:")
    for key, name in PAY_METHODS.items():
        print(f"  {key}. {name}")


def main():
    print("=== Counter — Deli Tax Calculator ===")
    print(f"Tax rate: {TAX_RATE * 100:.3f}%  |  Card surcharge: {CARD_SURCHARGE_RATE * 100:.0f}%\n")
    print("Type 'done' at any time to quit.\n")

    while True:
        print_categories()
        user_input = input("\nPrice: $").strip()

        if user_input.lower() == "done":
            print("\nSession ended. Thanks!")
            break

        try:
            price = float(user_input)
        except ValueError:
            print("Please enter a valid number (e.g. 4.50) or 'done'.")
            continue

        if price < 0:
            print("Price can't be negative. Try again.")
            continue

        cat_input = input("Category #: ").strip()
        if cat_input.lower() == "done":
            print("\nSession ended. Thanks!")
            break
        if cat_input not in CATEGORIES:
            print("Not a valid category number. Try again.")
            continue

        print_pay_methods()
        pay_input = input("Payment #: ").strip()
        if pay_input.lower() == "done":
            print("\nSession ended. Thanks!")
            break
        if pay_input not in PAY_METHODS:
            print("Not a valid payment method. Try again.")
            continue

        name, taxable = CATEGORIES[cat_input]
        pay_method = PAY_METHODS[pay_input]
        tax, surcharge, total = calculate_total(price, taxable, pay_method)

        print(f"\n  Item category: {name}")
        print(f"  Payment:       {pay_method}")
        print(f"  Subtotal:      ${price:.2f}")
        print(f"  Tax:           ${tax:.2f}")
        if surcharge > 0:
            print(f"  Card surcharge: ${surcharge:.2f}")
        print(f"  Total:         ${total:.2f}\n")


if __name__ == "__main__":
    main()
