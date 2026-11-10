import os, re, sys

root = "/Users/premkumar/.gemini/antigravity/scratch/fresh-harvest/src"
all_routes = set([
    "/", "/fruits", "/vegetables", "/leafy", "/seasonal", "/regional", "/cart", "/checkout",
    "/account", "/account/login", "/account/orders", "/wishlist", "/fridge", "/fresh-plan",
    "/harvest-drops", "/market-pulse", "/matchmaker", "/perfect-pick", "/packaging",
    "/offline", "/unauthorized", "/mobile-app",
    "/admin", "/admin/dashboard", "/admin/inventory", "/admin/orders", "/admin/customers",
    "/admin/fulfillment", "/admin/harvest-drops", "/admin/market-pulse", "/admin/quality",
    "/admin/packaging", "/admin/suppliers", "/admin/catalog", "/admin/login"
])

button_issues = []
dead_links = []
fetch_calls = []

button_regex = re.compile(r"<button\b([^>]*)>(.*?)</button>", re.DOTALL)

for dirpath, _, filenames in os.walk(root):
    for f in filenames:
        if f.endswith(".tsx"):
            p = os.path.join(dirpath, f)
            with open(p, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                
                # Check buttons
                buttons = button_regex.findall(content)
                for attrs, inner in buttons:
                    # check if button has onClick or type="submit" or is inside form
                    has_click = "onClick" in attrs
                    has_submit = 'type="submit"' in attrs or "type='submit'" in attrs
                    has_disabled = "disabled" in attrs
                    if not (has_click or has_submit):
                        # check if it has title or role
                        clean_inner = re.sub(r"<[^>]+>", "", inner).strip()[:40]
                        button_issues.append((os.path.basename(p), clean_inner, attrs.strip()[:60]))

                # Check links
                for m in re.finditer(r'href=["\'](\/[a-zA-Z0-9_\-\/]*)["\']', content):
                    link = m.group(1)
                    if not link.startswith(("/product/", "/account/orders/", "/admin/harvest/")):
                        if link not in all_routes:
                            dead_links.append((os.path.basename(p), link))

                # Check fetch calls
                for m in re.finditer(r'fetch\(["\'`](/api/v1/[a-zA-Z0-9_\-\/]+)', content):
                    fetch_calls.append((os.path.basename(p), m.group(1)))

print("=== BUTTON AUDIT ===")
print(f"Total potential inert buttons: {len(button_issues)}")
for fname, text, attrs in button_issues[:15]:
    print(f"  [{fname}] Button text: \"{text}\" | Attrs: {attrs}")

print("\n=== LINK AUDIT ===")
print(f"Total unmapped links: {len(dead_links)}")
for fname, link in set(dead_links):
    print(f"  [{fname}] -> {link}")

print("\n=== FETCH AUDIT ===")
print(f"Total API fetch endpoints called: {len(set([endpoint for _, endpoint in fetch_calls]))}")
for ep in sorted(list(set([endpoint for _, endpoint in fetch_calls]))):
    print(f"  {ep}")

