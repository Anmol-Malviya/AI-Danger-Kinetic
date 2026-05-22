import os
import csv

def generate_url_dataset():
    # Phishing patterns (label = 1)
    phishing_domains = [
        "secure-login-paypal.com",
        "verify-appleid-support.com",
        "chase-banking-alert.net",
        "net-banking-login-auth.com",
        "netflix-verify-account.info",
        "amazon-ref-signin.com",
        "update-facebook-security.org",
        "google-security-update-notice.com",
        "wellsfargo-access-login.com",
        "microsoft-password-reset-help.com",
        "steam-community-rewards.xyz",
        "instagram-verify-badge-free.com",
        "binance-withdrawal-auth.net",
        "metamask-restore-wallet.xyz",
        "irs-tax-refund-portal.gov-claims.net",
        "dhl-package-tracking-hold.info",
        "fedex-delivery-redirection.com",
        "usps-address-update-fees.net",
        "free-giftcard-giveaway.xyz",
        "win-iphone15-now.xyz",
        "covid19-relief-funds.net",
        "bankofamerica-card-security.info",
        "coinbase-login-verify.xyz",
        "dropbox-shared-file-download.net",
        "adobe-pdf-viewer-online.info"
    ]
    
    phishing_paths = [
        "/login",
        "/signin",
        "/verify",
        "/account/security",
        "/secure/auth",
        "/billing-update",
        "/reset-password",
        "/restore/wallet",
        "/free-gifts",
        "/claim-prize"
    ]
    
    phishing_urls = []
    # Mix domains and paths
    for domain in phishing_domains:
        for path in phishing_paths[:4]:
            phishing_urls.append(f"http://{domain}{path}")
            phishing_urls.append(f"https://{domain}{path}?session_id=12893891&ref=security")
            
    # Safe domains (label = 0)
    safe_domains = [
        "paypal.com",
        "apple.com",
        "chase.com",
        "netflix.com",
        "amazon.com",
        "facebook.com",
        "google.com",
        "wellsfargo.com",
        "microsoft.com",
        "steampowered.com",
        "instagram.com",
        "binance.com",
        "metamask.io",
        "irs.gov",
        "dhl.com",
        "fedex.com",
        "usps.com",
        "wikipedia.org",
        "github.com",
        "stackoverflow.com",
        "nytimes.com",
        "cnn.com",
        "reddit.com",
        "medium.com",
        "spotify.com"
    ]
    
    safe_paths = [
        "",
        "/",
        "/about",
        "/contact",
        "/help/faq",
        "/products/all",
        "/news/today",
        "/settings/profile",
        "/docs/api",
        "/download"
    ]
    
    safe_urls = []
    for domain in safe_domains:
        for path in safe_paths[:4]:
            safe_urls.append(f"https://www.{domain}{path}")
            safe_urls.append(f"https://{domain}{path}")

    # Combine and save
    os.makedirs("dataset", exist_ok=True)
    with open("dataset/urls.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["url", "label"])
        for url in phishing_urls:
            writer.writerow([url, 1])
        for url in safe_urls:
            writer.writerow([url, 0])
            
    print(f"Generated {len(phishing_urls) + len(safe_urls)} URLs (phishing: {len(phishing_urls)}, safe: {len(safe_urls)})")

def generate_text_dataset():
    # Scam texts (label = 1)
    scam_texts = [
        "URGENT: Your Chase account has been locked due to suspicious activity. Please verify your identity immediately: http://chase-banking-alert.net/verify",
        "Congratulations! You have won a $1000 Amazon Gift Card. Claim your reward now by clicking here: https://win-giftcard-free.xyz/claim",
        "ALERT: Your FedEx package cannot be delivered due to an incorrect address. Update your address and pay $1.50 fee: http://fedex-delivery-redirection.com",
        "PayPal: We detected a login from an unknown device. If this was not you, please secure your account immediately: http://secure-login-paypal.com/signin",
        "Dear Customer, your bank card has been suspended. Please call 1-800-BANK or click here to verify details: http://net-banking-login-auth.com",
        "Your Netflix subscription has expired. Update your billing information to continue streaming: http://netflix-verify-account.info",
        "Google: Someone has your password. Protect your account now at http://google-security-update-notice.com/security",
        "Bank Alert: Did you transfer $500 to John? If NO, cancel this transaction immediately at http://wellsfargo-access-login.com",
        "Your package from DHL is on hold at our distribution center. Confirm shipment details here: http://dhl-package-tracking-hold.info",
        "IRS Notice: You have an outstanding tax refund of $820. Claim your tax refund portal link here: http://irs-tax-refund-portal.gov-claims.net",
        "Security Alert: Your Apple ID is locked. Click here to verify your account and restore access: http://verify-appleid-support.com",
        "Final warning: Your power bill is past due. To avoid shutoff today, pay immediately at http://free-giftcard-giveaway.xyz",
        "Get $500 free crypto standard reward from Binance. Sign in here to unlock your funds: http://binance-withdrawal-auth.net",
        "Verify your Metamask wallet seed phrase to prevent account suspension: http://metamask-restore-wallet.xyz/restore/wallet",
        "Congratulations! Your phone number won the lottery! Click to claim $50,000 cash reward: http://win-iphone15-now.xyz",
        "Your order #4829 has been shipped. Track your shipment details at http://usps-address-update-fees.net",
        "Important notification from Wells Fargo: please review the security update on your account: http://wellsfargo-access-login.com",
        "Facebook Security: We noticed suspicious logins on your page. Verify ownership now: http://update-facebook-security.org",
        "URGENT Action Required: Confirm your identity within 24 hours to keep your debit card active: http://bankofamerica-card-security.info",
        "Steam Rewards: Claim your free Counter-Strike skins now! Log in to steam: http://steam-community-rewards.xyz"
    ]
    
    # Safe texts (label = 0)
    safe_texts = [
        "Hey! Are we still meeting for lunch today at 1 PM? Let me know.",
        "Your verification code is 482910. Do not share this code with anyone.",
        "Hi John, I've sent you the files for the project review. Let me know if you have any questions.",
        "Can you pick up some milk and eggs on your way home? Thanks!",
        "Thanks for subscription! Your receipt for order #83910 is attached. Netflix.",
        "Hey, just checking in to see how your mom is doing after the surgery.",
        "Don't forget to submit the report before the end of the day. Have a great weekend!",
        "Hey buddy, happy birthday! Hope you have an awesome day and a great year ahead.",
        "Your flight to New York is confirmed for tomorrow at 8:30 AM. Terminal 3, Gate 12.",
        "The team meeting is rescheduled to 2:00 PM in the main conference room.",
        "Your appointment with Dr. Smith is scheduled for Monday, Oct 12 at 10:00 AM.",
        "Thanks for ordering from Amazon! Your item has been shipped and will arrive tomorrow.",
        "Hi, are you free for a call sometime this afternoon? Need to discuss the marketing budget.",
        "Just wanted to say thanks for the dinner last night. We had a wonderful time!",
        "Hey, did you watch the latest episode of that show? We need to talk about the ending!",
        "Your monthly credit card statement is now available online. Log in to your secure portal to view it.",
        "Hi there, your package from USPS has been delivered to your front porch. Thank you.",
        "We are meeting at the park at 4 PM. Bring your running shoes!",
        "Your Google security code is 901238. This is only valid for 10 minutes.",
        "Hey! Can you send me the address of the restaurant? We are leaving now."
    ]
    
    # To expand the dataset, we'll duplicate texts with slight variations
    all_texts = []
    labels = []
    
    # Generate 150 scam and 150 safe texts
    for i in range(150):
        scam_idx = i % len(scam_texts)
        safe_idx = i % len(safe_texts)
        
        # Add slight modifications for variety
        scam_text = scam_texts[scam_idx]
        if i % 3 == 0:
            scam_text = scam_text.replace("URGENT:", "IMMEDIATE:")
        elif i % 3 == 1:
            scam_text = scam_text.replace("Click here", "Log in now")
            
        safe_text = safe_texts[safe_idx]
        if i % 3 == 0:
            safe_text = safe_text.replace("Hey!", "Hello,")
        elif i % 3 == 1:
            safe_text = safe_text.replace("Buddy", "Friend")
            
        all_texts.append(scam_text)
        labels.append(1)
        all_texts.append(safe_text)
        labels.append(0)

    # Save
    os.makedirs("dataset", exist_ok=True)
    with open("dataset/messages.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        for text, label in zip(all_texts, labels):
            writer.writerow([text, label])
            
    print(f"Generated {len(all_texts)} messages (scam: {labels.count(1)}, safe: {labels.count(0)})")

if __name__ == "__main__":
    generate_url_dataset()
    generate_text_dataset()
