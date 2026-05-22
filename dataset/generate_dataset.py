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
        # YONO / SBI / Indian banking scams
        "Dear Customer, your YONO SBI Bank account will be suspended today. Please avoid suspension by updating your KYC at http://yono-sbi-kyc.com/update",
        "ALERT: Your SBI NetBanking account has been blocked due to suspicious activity. To reactivate, click here: http://sbi-net-banking.net/login",
        "Dear customer, your SBI YONO account has expired. Please verify your Aadhaar card and PAN details now: http://yono-sbi-verification.xyz",
        "SBI Alert: Your YONO account will be permanently deactivated. Tap to avoid suspension: http://sbi-yono-update.online/kyc",
        "Important: Your SBI credit card has been blocked. Call customer care or update KYC immediately at http://sbi-card-verify.net",
        "Dear Customer, your Yono SBI account has been locked. Verify now at http://yono-sbi-security.info",
        "Attention: Your HDFC bank account requires immediate KYC verification. To avoid deactivation, click: http://hdfc-kyc-verify.net",
        "ICICI Bank Alert: We detected unusual login activity. Confirm your password here: http://icicibank-secure-login.online",
        "Paytm KYC expired! Your wallet will be suspended within 24 hours. Verify now: http://paytm-kyc-verification.xyz",
        "Dear customer, your bank account has been blocked. Update your PAN card details to avoid suspension: http://netbanking-update-pan.org",
        
        # Courier / Delivery scams
        "India Post: Your package cannot be delivered due to wrong address info. Update address & pay online fee: http://indiapost-delivery-fees.xyz",
        "USPS Alert: Your package is on hold at our distribution facility. Update address at http://usps-address-update-fees.net",
        "DHL Express: Shipment failed due to unpaid customs duties. Pay immediately to clear delivery: http://dhl-package-tracking-hold.info",
        "FedEx Notification: Your parcel requires address verification. Please visit http://fedex-delivery-redirection.com to reschedule.",
        
        # Utility bill scams
        "ALERT: Your electricity connection will be disconnected tonight at 9:30 PM due to unpaid monthly bill. Call helpline: 89028-19302 immediately.",
        "Electricity Board: Your electricity bill is past due. To avoid immediate power shutoff, pay now: http://electricity-bill-pay.xyz",
        "Attention: Electricity connection will be cut today. Pay pending due of Rs 4890 at http://utility-bill-payment.online",
        
        # Job / Work from home scams
        "Earn Rs 2000-5000 daily by liking YouTube videos. Work from home, no experience needed. Join WhatsApp group: http://whatsapp-job-scam.xyz",
        "Part-time job opportunity: Earn easy money online. Work just 1 hour daily. Guaranteed income. Join Telegram: http://telegram-job-group.link",
        "Congratulations! You are selected for a part-time job. Daily income up to Rs 8000. Start now: http://work-from-home-rewards.click",
        "Make money fast with no investment! Daily payout. Click here to sign up: http://easy-money-guaranteed.xyz",
        
        # Reward / Lottery scams
        "You have won a cash prize of Rs 25 Lakhs in Kaun Banega Crorepati (KBC) lottery. Claim your prize on WhatsApp: http://kbc-lottery-winner.online",
        "Congratulations! Your phone number has won a free iPhone 15 Pro. Claim your reward now: http://win-iphone15-now.xyz",
        "You are the lucky winner of a $1000 Amazon Gift Card! Click here to redeem: https://win-giftcard-free.xyz/claim",
        "Congratulations! You won the weekly jackpot! Tap link to claim your reward of $10,000 cash: http://lucky-winner-rewards.top",
        
        # OTP / credential theft
        "URGENT: Your Chase account has been locked due to suspicious activity. Please verify your identity immediately: http://chase-banking-alert.net/verify",
        "PayPal: We detected a login from an unknown device. If this was not you, please secure your account immediately: http://secure-login-paypal.com/signin",
        "Your Netflix subscription has expired. Update your billing information to continue streaming: http://netflix-verify-account.info",
        "Google: Someone has your password. Protect your account now at http://google-security-update-notice.com/security",
        "Security Alert: Your Apple ID is locked. Click here to verify your account and restore access: http://verify-appleid-support.com",
        "Verify your Metamask wallet seed phrase to prevent account suspension: http://metamask-restore-wallet.xyz/restore/wallet",
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
        "Hey! Can you send me the address of the restaurant? We are leaving now.",
        "Hi, your SBI account has been credited with INR 5,000.00. Available balance is INR 23,450.00.",
        "Your transaction at HDFC Bank of Rs. 1,200.00 was successful. Card ending in 4592.",
        "Dear Customer, welcome to NetBanking. Have a pleasant experience using our online services.",
        "Please find the attached bank statement for your credit card for the month of April.",
        "Hello, this is to inform you that your delivery from DHL will arrive today between 2 PM and 5 PM.",
        "Your package from Amazon is out for delivery. You can track it here: amazon.com/track",
        "Hi, just reminding you that our weekly status meeting starts in 10 minutes.",
        "Dear employee, your monthly payslip for May is now available on the HR portal.",
        "Your appointment is confirmed. If you need to reschedule, please contact our help desk.",
        "Hi, did you get a chance to review the presentation deck I shared yesterday?"
    ]
    
    # Generate 300 scam and 300 safe texts (600 total)
    all_texts = []
    labels = []
    
    for i in range(300):
        scam_idx = i % len(scam_texts)
        safe_idx = i % len(safe_texts)
        
        # Add slight modifications for variety
        scam_text = scam_texts[scam_idx]
        if i % 3 == 0:
            scam_text = scam_text.replace("URGENT:", "IMMEDIATE:")
            scam_text = scam_text.replace("Dear Customer,", "Dear User,")
        elif i % 3 == 1:
            scam_text = scam_text.replace("Click here", "Log in now")
            scam_text = scam_text.replace("alert", "warning")
            
        safe_text = safe_texts[safe_idx]
        if i % 3 == 0:
            safe_text = safe_text.replace("Hey!", "Hello,")
        elif i % 3 == 1:
            safe_text = safe_text.replace("buddy", "friend")
            
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
