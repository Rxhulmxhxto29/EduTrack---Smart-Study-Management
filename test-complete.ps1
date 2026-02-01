# EduTrack Complete Backend Testing Script
# This script tests ALL features to ensure backend is production-ready

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  EduTrack Backend - Complete Testing Suite" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$TestScript
    )
    
    Write-Host "`nTest: $Name" -ForegroundColor Yellow
    Write-Host ("=" * 60) -ForegroundColor Gray
    
    try {
        & $TestScript
        $script:testsPassed++
        Write-Host "[PASS] $Name" -ForegroundColor Green
        return $true
    } catch {
        $script:testsFailed++
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        return $false
    }
}

# Test 1: Server Health Check
Test-Endpoint "Server Health Check" {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($response.status -ne "OK") {
        throw "Server health check failed"
    }
    Write-Host "  Status: $($response.status)" -ForegroundColor Green
    Write-Host "  Message: $($response.message)" -ForegroundColor Gray
}

# Test 2: Admin Registration
$adminToken = $null
Test-Endpoint "Admin Registration" {
    $body = @{
        name = "Test Admin"
        email = "admin@edutrack.com"
        password = "admin123456"
        role = "admin"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    
    if (-not $response.success) {
        throw "Admin registration failed"
    }
    
    $script:adminToken = $response.data.token
    Write-Host "  Admin: $($response.data.user.name)" -ForegroundColor Green
    Write-Host "  Email: $($response.data.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($response.data.user.role)" -ForegroundColor Gray
    Write-Host "  Token received: $($script:adminToken.Substring(0,30))..." -ForegroundColor Gray
}

# Test 3: Admin Login
Test-Endpoint "Admin Login" {
    $body = @{
        email = "admin@edutrack.com"
        password = "admin123456"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    
    if (-not $response.success) {
        throw "Login failed"
    }
    
    Write-Host "  Login successful!" -ForegroundColor Green
    Write-Host "  User: $($response.data.user.name)" -ForegroundColor Gray
}

# Test 4: Get Admin Profile
Test-Endpoint "Get User Profile" {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get profile"
    }
    
    Write-Host "  Profile loaded: $($response.data.name)" -ForegroundColor Green
    Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
}

# Test 5: Create Subject
$subjectId = $null
Test-Endpoint "Create Subject" {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        name = "Data Structures and Algorithms"
        code = "CSE201"
        branch = "CSE"
        semester = 3
        credits = 4
        description = "Learn fundamental data structures and algorithms"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/subjects" -Method Post -Headers $headers -Body $body
    
    if (-not $response.success) {
        throw "Failed to create subject"
    }
    
    $script:subjectId = $response.data.subject._id
    Write-Host "  Subject: $($response.data.subject.name)" -ForegroundColor Green
    Write-Host "  Code: $($response.data.subject.code)" -ForegroundColor Gray
    Write-Host "  Branch: $($response.data.subject.branch)" -ForegroundColor Gray
    Write-Host "  Subject ID: $script:subjectId" -ForegroundColor Gray
}

# Test 6: Get All Subjects
Test-Endpoint "Get All Subjects" {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/subjects" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get subjects"
    }
    
    Write-Host "  Total subjects: $($response.data.Count)" -ForegroundColor Green
    foreach ($subject in $response.data) {
        Write-Host "  - $($subject.name) ($($subject.code))" -ForegroundColor Gray
    }
}

# Test 7: Create Unit
$unitId = $null
Test-Endpoint "Create Unit" {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        name = "Arrays and Linked Lists"
        unitNumber = 1
        description = "Introduction to linear data structures"
        topics = @(
            @{
                name = "Arrays"
                description = "Understanding arrays and operations"
            },
            @{
                name = "Linked Lists"
                description = "Single and double linked lists"
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/subjects/$subjectId/units" -Method Post -Headers $headers -Body $body
    
    if (-not $response.success) {
        throw "Failed to create unit"
    }
    
    $script:unitId = $response.data.unit._id
    Write-Host "  Unit: $($response.data.unit.name)" -ForegroundColor Green
    Write-Host "  Unit Number: $($response.data.unit.unitNumber)" -ForegroundColor Gray
    Write-Host "  Topics: $($response.data.unit.topics.Count)" -ForegroundColor Gray
    Write-Host "  Unit ID: $script:unitId" -ForegroundColor Gray
}

# Test 8: Get Units for Subject
Test-Endpoint "Get Units for Subject" {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/subjects/$subjectId/units" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get units"
    }
    
    Write-Host "  Total units: $($response.data.Count)" -ForegroundColor Green
    foreach ($unit in $response.data) {
        Write-Host "  - Unit $($unit.unitNumber): $($unit.name)" -ForegroundColor Gray
    }
}

# Test 9: Register Teacher
$teacherToken = $null
Test-Endpoint "Register Teacher" {
    $body = @{
        name = "Prof. John Smith"
        email = "teacher@edutrack.com"
        password = "teacher123"
        role = "teacher"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    
    if (-not $response.success) {
        throw "Teacher registration failed"
    }
    
    $script:teacherToken = $response.data.token
    Write-Host "  Teacher: $($response.data.user.name)" -ForegroundColor Green
    Write-Host "  Role: $($response.data.user.role)" -ForegroundColor Gray
}

# Test 10: Register Student
$studentToken = $null
Test-Endpoint "Register Student" {
    $body = @{
        name = "John Doe"
        email = "student@edutrack.com"
        password = "student123"
        role = "student"
        enrollmentNumber = "2024CSE001"
        branch = "CSE"
        semester = 3
        section = "A"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    
    if (-not $response.success) {
        throw "Student registration failed"
    }
    
    $script:studentToken = $response.data.token
    Write-Host "  Student: $($response.data.user.name)" -ForegroundColor Green
    Write-Host "  Enrollment: $($response.data.user.enrollmentNumber)" -ForegroundColor Gray
    Write-Host "  Branch: $($response.data.user.branch), Semester: $($response.data.user.semester)" -ForegroundColor Gray
}

# Test 11: Get All Users (Admin only)
Test-Endpoint "Get All Users (Admin)" {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/users" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get users"
    }
    
    Write-Host "  Total users: $($response.data.Count)" -ForegroundColor Green
    foreach ($user in $response.data) {
        Write-Host "  - $($user.name) ($($user.role))" -ForegroundColor Gray
    }
}

# Test 12: Create Assignment
$assignmentId = $null
Test-Endpoint "Create Assignment" {
    $headers = @{
        "Authorization" = "Bearer $teacherToken"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        title = "Arrays Implementation"
        description = "Implement basic array operations"
        subject = $subjectId
        unit = $unitId
        dueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        maxMarks = 100
        targetBranch = "CSE"
        targetSemester = 3
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/assignments" -Method Post -Headers $headers -Body $body
    
    if (-not $response.success) {
        throw "Failed to create assignment"
    }
    
    $script:assignmentId = $response.data.assignment._id
    Write-Host "  Assignment: $($response.data.assignment.title)" -ForegroundColor Green
    Write-Host "  Max Marks: $($response.data.assignment.maxMarks)" -ForegroundColor Gray
    Write-Host "  Due Date: $($response.data.assignment.dueDate)" -ForegroundColor Gray
}

# Test 13: Get Assignments (Student)
Test-Endpoint "Get Assignments (Student)" {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/assignments" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get assignments"
    }
    
    Write-Host "  Available assignments: $($response.data.Count)" -ForegroundColor Green
    foreach ($assignment in $response.data) {
        Write-Host "  - $($assignment.title) (Max: $($assignment.maxMarks))" -ForegroundColor Gray
    }
}

# Test 14: Create Timetable Entry
$timetableId = $null
Test-Endpoint "Create Timetable Entry" {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        subject = $subjectId
        dayOfWeek = "Monday"
        startTime = "09:00"
        endTime = "10:00"
        type = "lecture"
        room = "Room 301"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/timetable" -Method Post -Headers $headers -Body $body
    
    if (-not $response.success) {
        throw "Failed to create timetable entry"
    }
    
    $script:timetableId = $response.data.timetable._id
    Write-Host "  Timetable entry created" -ForegroundColor Green
    Write-Host "  Day: $($response.data.timetable.dayOfWeek)" -ForegroundColor Gray
    Write-Host "  Time: $($response.data.timetable.startTime) - $($response.data.timetable.endTime)" -ForegroundColor Gray
}

# Test 15: Get Timetable
Test-Endpoint "Get Timetable" {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/timetable" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get timetable"
    }
    
    Write-Host "  Total entries: $($response.data.Count)" -ForegroundColor Green
    foreach ($entry in $response.data) {
        Write-Host "  - $($entry.dayOfWeek) $($entry.startTime)-$($entry.endTime) ($($entry.type))" -ForegroundColor Gray
    }
}

# Test 16: Mark Topic as Complete
Test-Endpoint "Mark Topic as Complete" {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        subjectId = $subjectId
        unitId = $unitId
        topicName = "Arrays"
        confidenceLevel = "high"
        notes = "Completed all array operations practice"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/progress/mark-complete" -Method Post -Headers $headers -Body $body
    
    if (-not $response.success) {
        throw "Failed to mark topic complete"
    }
    
    Write-Host "  Topic marked complete: $($body | ConvertFrom-Json | Select-Object -ExpandProperty topicName)" -ForegroundColor Green
    Write-Host "  Confidence: $($body | ConvertFrom-Json | Select-Object -ExpandProperty confidenceLevel)" -ForegroundColor Gray
}

# Test 17: Get Progress
Test-Endpoint "Get Progress" {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/progress" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get progress"
    }
    
    Write-Host "  Progress records: $($response.data.Count)" -ForegroundColor Green
    foreach ($prog in $response.data) {
        $completedCount = ($prog.completedTopics | Where-Object { $_.isCompleted }).Count
        Write-Host "  - Subject progress: $completedCount topics completed" -ForegroundColor Gray
    }
}

# Test 18: Get Progress Stats
Test-Endpoint "Get Progress Statistics" {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/progress/stats" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get stats"
    }
    
    Write-Host "  Overall completion: $($response.data.overallCompletion)%" -ForegroundColor Green
    Write-Host "  Total subjects: $($response.data.totalSubjects)" -ForegroundColor Gray
    Write-Host "  Completed topics: $($response.data.totalCompletedTopics)" -ForegroundColor Gray
}

# Test 19: Create Announcement
$announcementId = $null
Test-Endpoint "Create Announcement" {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        title = "Welcome to EduTrack!"
        content = "This is a system-wide announcement for all students."
        type = "general"
        priority = "high"
        targetRole = "student"
        targetBranch = "CSE"
        targetSemester = 3
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/announcements" -Method Post -Headers $headers -Body $body
    
    if (-not $response.success) {
        throw "Failed to create announcement"
    }
    
    $script:announcementId = $response.data.announcement._id
    Write-Host "  Announcement: $($response.data.announcement.title)" -ForegroundColor Green
    Write-Host "  Priority: $($response.data.announcement.priority)" -ForegroundColor Gray
    Write-Host "  Target: $($response.data.announcement.targetAudience)" -ForegroundColor Gray
}

# Test 20: Get Announcements (Student)
Test-Endpoint "Get Announcements (Student)" {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/announcements" -Method Get -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to get announcements"
    }
    
    Write-Host "  Available announcements: $($response.data.Count)" -ForegroundColor Green
    foreach ($announcement in $response.data) {
        Write-Host "  - $($announcement.title) [$($announcement.priority)]" -ForegroundColor Gray
    }
}

# Test 21: Mark Announcement as Read
Test-Endpoint "Mark Announcement as Read" {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/announcements/$announcementId/read" -Method Post -Headers $headers
    
    if (-not $response.success) {
        throw "Failed to mark announcement as read"
    }
    
    Write-Host "  Announcement marked as read" -ForegroundColor Green
}

# Final Summary
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  Test Results Summary" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red

if ($testsFailed -eq 0) {
    Write-Host "`n SUCCESS! All backend features working perfectly!" -ForegroundColor Green
    Write-Host " Backend is production-ready for frontend integration!" -ForegroundColor Green
} else {
    Write-Host "`n WARNING: Some tests failed. Please review errors above." -ForegroundColor Yellow
}

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  Test Accounts Created" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "Admin Account:" -ForegroundColor Yellow
Write-Host "  Email: admin@edutrack.com" -ForegroundColor Cyan
Write-Host "  Password: admin123456" -ForegroundColor Cyan

Write-Host "`nTeacher Account:" -ForegroundColor Yellow
Write-Host "  Email: teacher@edutrack.com" -ForegroundColor Cyan
Write-Host "  Password: teacher123" -ForegroundColor Cyan

Write-Host "`nStudent Account:" -ForegroundColor Yellow
Write-Host "  Email: student@edutrack.com" -ForegroundColor Cyan
Write-Host "  Password: student123" -ForegroundColor Cyan
Write-Host "  Enrollment: 2024CSE001" -ForegroundColor Cyan

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  Ready for Frontend Development!" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "Server: http://localhost:5000" -ForegroundColor Green
Write-Host "API Base: http://localhost:5000/api" -ForegroundColor Green
Write-Host "Health: http://localhost:5000/health" -ForegroundColor Green
Write-Host "`n"
