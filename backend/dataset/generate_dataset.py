import os
import csv
import random

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
        "adobe-pdf-viewer-online.info",
        "openai-gpt5-beta-access.xyz",
        "zoom-meeting-record-download.net",
        "slack-workspace-invite-auth.com",
        "discord-nitro-gift-free.xyz",
        "github-security-alert-verify.com",
        "kotak-netbanking-verify.xyz",
        "axisbank-kyc-update.online",
        "hdfc-netbanking-verification.info",
        "paytm-wallet-refund-bonus.net",
        "phonepe-scratchcard-win.xyz",
        "royalmail-parcel-redeliver.top",
        "fedex-tracking-invoice-hold.site",
        "coinbase-wallet-recovery-key.net",
        "blockchain-wallet-restore.com"
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
    # Mix domains and paths (use first 6 paths for balance)
    for domain in phishing_domains:
        for path in phishing_paths[:6]:
            phishing_urls.append(f"http://{domain}{path}")
            phishing_urls.append(f"https://{domain}{path}?session_id={10000000 + hash(domain) % 90000000}&ref=security")
            
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
        "spotify.com",
        "openai.com",
        "zoom.us",
        "slack.com",
        "discord.com",
        "adobe.com",
        "kotak.com",
        "axisbank.com",
        "hdfcbank.com",
        "icicibank.com",
        "paytm.com",
        "phonepe.com",
        "royalmail.com",
        "coinbase.com",
        "blockchain.com",
        "python.org",
        "npmjs.com"
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
    # Mix domains and paths (use first 6 paths for balance)
    for domain in safe_domains:
        for path in safe_paths[:6]:
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
    # Templates for Scam texts (label = 1)
    scam_templates = [
        # Banking suspension
        "Dear {User}, your {Bank} account will be suspended. To prevent deactivation, update your KYC immediately at {Url}",
        "Alert: Your {Bank} netbanking access is blocked due to suspicious activity. Verify details now: {Url}",
        "Dear customer, your {Bank} card has been blocked. Click here to reactivate: {Url}",
        "{Bank} Notice: Unused rewards points expiring today! Claim your cash back of {Amount} now: {Url}",
        "Action Required: Unusual sign-in attempt detected on your {Bank} account. Secure it now: {Url}",
        "Dear customer, update your PAN/Aadhaar card for {Bank} account to avoid deactivation: {Url}",
        
        # Crypto
        "Verify your {Wallet} wallet recovery phrase within 24 hours to avoid losing access: {Url}",
        "Security Alert: A login attempt was made on your {Wallet} from {City}. Confirm seed phrase: {Url}",
        
        # OTP / Credential Theft
        "Your {Brand} account has been compromised. Log in immediately to reset your password: {Url}",
        "Urgent: Verification required for your {Brand} subscription. Click here to update your billing details: {Url}",
        "We detected a suspicious login on your {Brand} account. If this was not you, secure your account at {Url}",
        
        # Courier / Delivery
        "India Post: Your parcel has arrived at the sorting center but has an incorrect address. Fix it now: {Url}",
        "USPS Update: Package delivery failed due to unpaid customs fee of {Amount}. Update details: {Url}",
        "DHL Express: Your shipment from {City} is on hold. Resolve delivery issues at {Url}",
        "FedEx Alert: Address correction required for parcel delivery. Reschedule at {Url}",
        
        # Utility bills
        "Dear customer, your electricity connection will be cut off tonight at 9:30 PM due to pending bill of {Amount}. Please call helpline: {Phone} immediately.",
        "Utility Board: Immediate power disconnection alert. Pay your unpaid bill at {Url} to avoid shutoff.",
        "Your monthly gas bill is overdue. Pay {Amount} now at {Url} to prevent service termination.",
        
        # Job Scams
        "Earn {Amount} daily by working part-time. No experience required. Start immediately on WhatsApp: {Url}",
        "Part-time home job vacancy: Earn up to {Amount} per week by liking social media posts. Join Telegram: {Url}",
        "Congratulations! You are selected for a work-from-home position. Daily wage of {Amount}. Register: {Url}",
        "Make money online with zero investment! Earn {Amount} every week. Sign up now: {Url}",
        
        # Lottery / Rewards
        "You have won a lottery prize of {Amount} from {Brand}! Contact customer service on WhatsApp to claim: {Url}",
        "Congratulations! Your mobile number has been selected to win a free {Item}. Claim your reward: {Url}",
        "Lucky Winner: You have won a {Brand} Gift Card worth {Amount}! Redeem your prize here: {Url}",
        "Jackpot Alert: You are the winner of {Amount} cash! Click to transfer to your bank account: {Url}",
    ]
    
    # Templates for Safe texts (label = 0)
    safe_templates = [
        "Hey! Are we still meeting for lunch today at {Time}? Let me know.",
        "Your {Brand} verification code is {Code}. Do not share this code with anyone.",
        "Hi {Name}, I've sent you the files for the project review. Let me know if you have any questions.",
        "Can you pick up some {Item} and eggs on your way home? Thanks!",
        "Thanks for your subscription! Your receipt for order #{Code} is attached. {Brand}.",
        "Hey, just checking in to see how your mom is doing after the surgery.",
        "Don't forget to submit the report before the end of the day. Have a great weekend!",
        "Hey {Name}, happy birthday! Hope you have an awesome day and a great year ahead.",
        "Your flight to {City} is confirmed for tomorrow at {Time}. Terminal 3, Gate {Code}.",
        "The team meeting is rescheduled to {Time} in the main conference room.",
        "Your appointment with Dr. {Name} is scheduled for Monday at {Time}.",
        "Thanks for ordering from {Brand}! Your item has been shipped and will arrive tomorrow.",
        "Hi, are you free for a call sometime this afternoon? Need to discuss the budget.",
        "Just wanted to say thanks for the dinner last night. We had a wonderful time!",
        "Hey, did you watch the latest episode of that show? We need to talk about the ending!",
        "Your monthly credit card statement for {Bank} is now available online. Log in to view it.",
        "Hi there, your package from USPS has been delivered to your front porch. Thank you.",
        "We are meeting at the park at {Time}. Bring your running shoes!",
        "Your {Brand} security code is {Code}. This is only valid for 10 minutes.",
        "Hey! Can you send me the address of the restaurant? We are leaving now.",
        "Hi, your {Bank} account has been credited with INR {Amount}. Available balance is INR {Amount}.",
        "Your transaction at {Bank} of Rs. {Amount} was successful. Card ending in {Code}.",
        "Dear Customer, welcome to NetBanking. Have a pleasant experience using our online services.",
        "Please find the attached bank statement for your credit card for the month of April.",
        "Hello, this is to inform you that your delivery from {Brand} will arrive today between 2 PM and 5 PM.",
        "Your package from {Brand} is out for delivery. You can track it here: {Url}",
        "Hi, just reminding you that our weekly status meeting starts in 10 minutes.",
        "Dear employee, your monthly payslip for May is now available on the HR portal.",
        "Your appointment is confirmed. If you need to reschedule, please contact our help desk.",
        "Hi, did you get a chance to review the presentation deck I shared yesterday?",
    ]

    # Placeholder lists for randomized generation
    users = ["Customer", "User", "Client", "Cardholder", "SBI Member"]
    banks = ["SBI", "YONO SBI", "HDFC Bank", "ICICI Bank", "Paytm", "Axis Bank", "Kotak Bank", "Chase", "Wells Fargo", "Bank of America"]
    brands = ["Google", "Microsoft", "Facebook", "Amazon", "Netflix", "Apple", "Spotify", "DHL", "FedEx", "India Post"]
    wallets = ["Metamask", "Coinbase", "TrustWallet", "Blockchain"]
    cities = ["Delhi", "Mumbai", "Bangalore", "New York", "London", "Chicago", "Dubai"]
    names = ["John", "Sarah", "Emily", "David", "Rajesh", "Priya", "Amit", "Jessica", "Smith", "Sharma"]
    items = ["milk", "bread", "coffee", "grocery", "iPhone 15 Pro", "Samsung S24 Ultra", "iPad Air"]
    times = ["1:00 PM", "3:30 PM", "9:00 AM", "6:15 PM", "12 noon"]
    urls = [
        "http://sbi-kyc-verify.net", "http://yono-sbi-alert.online", "http://hdfc-security-login.info",
        "http://paytm-wallet-update.xyz", "http://icicibank-secure.org", "http://netflix-billing-update.xyz",
        "http://verify-appleid-support.com", "http://metamask-restore-wallet.xyz", "http://usps-address-update-fees.net",
        "http://indiapost-delivery-fees.xyz", "http://whatsapp-job-scam.xyz", "http://telegram-job-group.link"
    ]
    safe_urls = ["amazon.com/track", "fedex.com/track", "dhl.com/tracking", "github.com", "google.com"]
    phones = ["89028-19302", "98122-38291", "88291-03928", "72019-38291"]

    all_texts = []
    labels = []

    # Generate 500 scam and 500 safe messages (1000 total)
    for i in range(500):
        # 1. Generate Scam Text
        tmpl_scam = random.choice(scam_templates)
        scam_text = tmpl_scam.format(
            User=random.choice(users),
            Bank=random.choice(banks),
            Brand=random.choice(brands),
            Wallet=random.choice(wallets),
            City=random.choice(cities),
            Url=random.choice(urls),
            Amount=f"Rs. {random.randint(1000, 50000)}" if random.random() > 0.5 else f"${random.randint(50, 1000)}",
            Phone=random.choice(phones),
            Item=random.choice(items[:4])
        )
        all_texts.append(scam_text)
        labels.append(1)

        # 2. Generate Safe Text
        tmpl_safe = random.choice(safe_templates)
        safe_text = tmpl_safe.format(
            Name=random.choice(names),
            Brand=random.choice(brands),
            Bank=random.choice(banks),
            City=random.choice(cities),
            Item=random.choice(items[:4]),
            Time=random.choice(times),
            Code=str(random.randint(100000, 999999)),
            Amount=f"{random.randint(100, 5000)}.00" if random.random() > 0.5 else f"Rs. {random.randint(500, 15000)}",
            Url=random.choice(safe_urls)
        )
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

