Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SHIELDX AI - API TEST SUITE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# TEST 1: Dashboard /threat-score
Write-Host ">>> TEST 1: GET /threat-score (Dashboard Stats)" -ForegroundColor Yellow
try {
    $r1 = Invoke-RestMethod -Uri "http://127.0.0.1:8000/threat-score" -Method GET
    $score = $r1.threat_score
    $total = $r1.total_scans
    $safe = $r1.metrics.safe
    $warn = $r1.metrics.warning
    $danger = $r1.metrics.dangerous
    Write-Host "  Threat Score  : $score%" -ForegroundColor White
    Write-Host "  Total Scans   : $total" -ForegroundColor White
    Write-Host "  Safe          : $safe" -ForegroundColor Green
    Write-Host "  Warning       : $warn" -ForegroundColor Yellow
    Write-Host "  Dangerous     : $danger" -ForegroundColor Red
    Write-Host "  [PASS] /threat-score working!" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] /threat-score failed: $_" -ForegroundColor Red
}
Write-Host ""

# TEST 2: URL Scanner - Phishing URL
Write-Host ">>> TEST 2: POST /scan-url (Phishing URL)" -ForegroundColor Yellow
try {
    $body2 = '{"url": "http://secure-login-paypal.com/verify"}'
    $r2 = Invoke-RestMethod -Uri "http://127.0.0.1:8000/scan-url" -Method POST -ContentType "application/json" -Body $body2
    $tl2 = $r2.threat_level
    $cf2 = $r2.confidence
    Write-Host "  URL           : http://secure-login-paypal.com/verify" -ForegroundColor White
    Write-Host "  Threat Level  : $tl2" -ForegroundColor Red
    Write-Host "  AI Confidence : $cf2%" -ForegroundColor White
    Write-Host "  [PASS] /scan-url (phishing) working!" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] /scan-url (phishing) failed: $_" -ForegroundColor Red
}
Write-Host ""

# TEST 3: URL Scanner - Safe URL
Write-Host ">>> TEST 3: POST /scan-url (Safe URL)" -ForegroundColor Yellow
try {
    $body3 = '{"url": "https://www.google.com"}'
    $r3 = Invoke-RestMethod -Uri "http://127.0.0.1:8000/scan-url" -Method POST -ContentType "application/json" -Body $body3
    $tl3 = $r3.threat_level
    $cf3 = $r3.confidence
    Write-Host "  URL           : https://www.google.com" -ForegroundColor White
    Write-Host "  Threat Level  : $tl3" -ForegroundColor Green
    Write-Host "  AI Confidence : $cf3%" -ForegroundColor White
    Write-Host "  [PASS] /scan-url (safe) working!" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] /scan-url (safe) failed: $_" -ForegroundColor Red
}
Write-Host ""

# TEST 4: SMS/Text Scanner - Scam Message
Write-Host ">>> TEST 4: POST /scan-text (Scam SMS)" -ForegroundColor Yellow
try {
    $body4 = '{"text": "URGENT: Your bank account has been suspended. Verify your OTP immediately to avoid permanent closure!"}'
    $r4 = Invoke-RestMethod -Uri "http://127.0.0.1:8000/scan-text" -Method POST -ContentType "application/json" -Body $body4
    $tl4 = $r4.threat_level
    $cf4 = $r4.confidence
    $uw4 = $r4.urgency_words -join ", "
    $fw4 = $r4.financial_words -join ", "
    Write-Host "  Threat Level  : $tl4" -ForegroundColor Red
    Write-Host "  AI Confidence : $cf4%" -ForegroundColor White
    Write-Host "  Urgency Words : $uw4" -ForegroundColor Yellow
    Write-Host "  Finance Words : $fw4" -ForegroundColor Yellow
    Write-Host "  [PASS] /scan-text working!" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] /scan-text failed: $_" -ForegroundColor Red
}
Write-Host ""

# TEST 5: Safe Message
Write-Host ">>> TEST 5: POST /scan-text (Safe Message)" -ForegroundColor Yellow
try {
    $body5 = '{"text": "Hey, meeting is scheduled for tomorrow at 10am. Please bring your project slides."}'
    $r5 = Invoke-RestMethod -Uri "http://127.0.0.1:8000/scan-text" -Method POST -ContentType "application/json" -Body $body5
    $tl5 = $r5.threat_level
    $cf5 = $r5.confidence
    Write-Host "  Threat Level  : $tl5" -ForegroundColor Green
    Write-Host "  AI Confidence : $cf5%" -ForegroundColor White
    Write-Host "  [PASS] /scan-text (safe msg) working!" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] /scan-text (safe) failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "  Frontend  : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend   : http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs  : http://localhost:8000/docs" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
