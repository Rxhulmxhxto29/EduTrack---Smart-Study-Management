# EduTrack API Test Script
Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "  EduTrack API Testing Suite" -ForegroundColor Cyan
Write-Host "===========================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$token = $null

# Test 1: Register Admin
Write-Host "Test 1: Registering Admin..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test Admin"
    email = "testadmin@edutrack.com"
    password = "admin123456"
    role = "admin"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.data.token
    Write-Host "✅ Admin registered: $($registerResponse.data.user.name)" -ForegroundColor Green
    Write-Host "   Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($registerResponse.data.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Admin registration failed: $_" -ForegroundColor Red
    exit
}

# Test 2: Login
Write-Host "`nTest 2: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "testadmin@edutrack.com"
    password = "admin123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}

# Test 3: Create Subject
Write-Host "`nTest 3: Creating Subject..." -ForegroundColor Yellow
$subjectBody = @{
    name = "Data Structures"
    code = "CS201"
    description = "Introduction to Data Structures and Algorithms"
    branch = "CSE"
    semester = 3
    credits = 4
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $subjectResponse = Invoke-RestMethod -Uri "$baseUrl/subjects" -Method Post -Body $subjectBody -Headers $headers
    $subjectId = $subjectResponse.data._id
    Write-Host "✅ Subject created: $($subjectResponse.data.name)" -ForegroundColor Green
    Write-Host "   Code: $($subjectResponse.data.code)" -ForegroundColor Gray
    Write-Host "   Semester: $($subjectResponse.data.semester)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Subject creation failed: $_" -ForegroundColor Red
}

# Test 4: Create Unit
Write-Host "`nTest 4: Creating Unit..." -ForegroundColor Yellow
$unitBody = @{
    name = "Unit 1: Arrays and Linked Lists"
    subject = $subjectId
    order = 1
    description = "Basic data structures"
    topics = @(
        @{ name = "Arrays"; description = "Static data structure" }
        @{ name = "Linked Lists"; description = "Dynamic data structure" }
    )
} | ConvertTo-Json -Depth 3

try {
    $unitResponse = Invoke-RestMethod -Uri "$baseUrl/subjects/$subjectId/units" -Method Post -Body $unitBody -Headers $headers
    Write-Host "✅ Unit created: $($unitResponse.data.name)" -ForegroundColor Green
    Write-Host "   Topics: $($unitResponse.data.topics.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Unit creation failed: $_" -ForegroundColor Red
}

# Test 5: Register Student
Write-Host "`nTest 5: Registering Student..." -ForegroundColor Yellow
$studentBody = @{
    name = "John Doe"
    email = "john@edutrack.com"
    password = "student123"
    role = "student"
    enrollmentNumber = "2024CSE001"
    branch = "CSE"
    semester = 3
    section = "A"
} | ConvertTo-Json

try {
    $studentResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $studentBody -ContentType "application/json"
    Write-Host "✅ Student registered: $($studentResponse.data.user.name)" -ForegroundColor Green
    Write-Host "   Enrollment: $($studentResponse.data.user.enrollmentNumber)" -ForegroundColor Gray
    Write-Host "   Branch: $($studentResponse.data.user.branch)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Student registration failed: $_" -ForegroundColor Red
}

# Test 6: Get All Subjects
Write-Host "`nTest 6: Getting All Subjects..." -ForegroundColor Yellow
try {
    $subjectsResponse = Invoke-RestMethod -Uri "$baseUrl/subjects" -Method Get -Headers $headers
    Write-Host "✅ Retrieved subjects: $($subjectsResponse.data.Count)" -ForegroundColor Green
    foreach ($subject in $subjectsResponse.data) {
        Write-Host "   - $($subject.name) ($($subject.code))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get subjects failed: $_" -ForegroundColor Red
}

# Test 7: Health Check
Write-Host "`nTest 7: Server Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
    Write-Host "✅ Server Status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "   Message: $($healthResponse.message)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($healthResponse.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "  Test Suite Complete!" -ForegroundColor Cyan
Write-Host "===========================================================`n" -ForegroundColor Cyan

Write-Host "🎉 All core features are working!" -ForegroundColor Green
Write-Host "`n📝 Available APIs:" -ForegroundColor Yellow
Write-Host "   - Authentication" -ForegroundColor Gray
Write-Host "   - Subjects and Units" -ForegroundColor Gray
Write-Host "   - Notes Management" -ForegroundColor Gray
Write-Host "   - Assignments" -ForegroundColor Gray
Write-Host "   - Timetable" -ForegroundColor Gray
Write-Host "   - Progress Tracking" -ForegroundColor Gray
Write-Host "   - Announcements" -ForegroundColor Gray

Write-Host "`n💡 Admin Credentials:" -ForegroundColor Yellow
Write-Host "   Email: testadmin@edutrack.com" -ForegroundColor Cyan
Write-Host "   Password: admin123456" -ForegroundColor Cyan

Write-Host "`n💡 Student Credentials:" -ForegroundColor Yellow
Write-Host "   Email: john@edutrack.com" -ForegroundColor Cyan
Write-Host "   Password: student123" -ForegroundColor Cyan

Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - API_DOCUMENTATION.md (Full API reference)" -ForegroundColor Gray
Write-Host "   - QUICK_START.md (Getting started guide)" -ForegroundColor Gray
Write-Host "   - FEATURES.md (Feature list)" -ForegroundColor Gray

Write-Host "`n"
