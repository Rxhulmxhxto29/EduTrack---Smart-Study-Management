const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api';
const EXPORT_FILE = 'feature_data_export.json';

const users = {
    student: {
        email: 'student@edutrack.com',
        password: 'student123',
        name: 'Rahul Mahato', // Matches seed
        role: 'student'
    },
    teacher: {
        email: 'teacher@edutrack.com',
        password: 'teacher123',
        name: 'Prof. Teacher',
        role: 'teacher'
    },
    admin: {
        email: 'admin@edutrack.com',
        password: 'admin123456',
        name: 'System Admin',
        role: 'admin'
    }
};

const fullDataExport = {
    timestamp: new Date().toISOString(),
    systemHealth: null,
    users: {},
    features: {}
};

async function getAuthToken(role, creds) {
    console.log(`\n� Authenticating ${role.toUpperCase()}...`);
    try {
        // Try Login first
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: creds.email,
            password: creds.password
        });
        console.log(`✅ Login successful`);
        fullDataExport.users[role] = res.data.data.user;
        return res.data.data.token;
    } catch (loginError) {
        if (loginError.response && loginError.response.status === 401) {
            console.log(`⚠️ Login failed (401). Attempting registration...`);
            try {
                // Register
                const regRes = await axios.post(`${API_URL}/auth/register`, {
                    name: creds.name,
                    email: creds.email,
                    password: creds.password,
                    role: creds.role,
                    // Extra fields for specific roles
                    ...(role === 'student' ? { branch: 'CSE', semester: 5, enrollmentNumber: 'NEW2024' } : {})
                });
                console.log(`✅ Registration successful`);
                fullDataExport.users[role] = regRes.data.data.user;
                return regRes.data.data.token;
            } catch (regError) {
                if (regError.response && regError.response.data.message.includes('exists')) {
                    console.error(`❌ User exists but login failed. Manual check required.`);
                } else {
                    console.error(`❌ Registration failed: ${regError.response?.data?.message || regError.message}`);
                }
                throw regError;
            }
        }
        throw loginError;
    }
}

async function runVerification() {
    console.log('🚀 Starting Full System Verification & Data Export...');

    try {
        // 1. Check System Health
        const health = await axios.get('http://localhost:5000/health');
        fullDataExport.systemHealth = health.data;
        console.log('✅ System Health: OK');

        // 2. Process Each User Role
        for (const [role, creds] of Object.entries(users)) {
            try {
                const token = await getAuthToken(role, creds);
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Role-specific checks
                if (role === 'student') {
                    console.log('  🔍 Checking Student Features...');

                    // Timetable
                    const timetable = await axios.get(`${API_URL}/timetable`, config);
                    const ttData = timetable.data.data;
                    fullDataExport.features.student_timetable = ttData;
                    console.log(`    ✅ Timetable: ${Array.isArray(ttData) ? ttData.length : 'Unknown'} entries`);

                    // Assignments
                    const assignments = await axios.get(`${API_URL}/assignments`, config);
                    fullDataExport.features.student_assignments = assignments.data.data;
                    console.log(`    ✅ Assignments: ${assignments.data.data?.length || 0} items`);

                    // Progress
                    const progress = await axios.get(`${API_URL}/progress`, config);
                    fullDataExport.features.student_progress = progress.data.data;
                    console.log(`    ✅ Progress: ${progress.data.data?.length || 0} records`);

                    // Flashcards
                    try {
                        const flashcards = await axios.get(`${API_URL}/flashcards`, config);
                        fullDataExport.features.student_flashcards = flashcards.data.data;
                        console.log(`    ✅ Flashcards: ${flashcards.data.data?.length || 0} cards`);
                    } catch (e) {
                        console.warn(`    ⚠️ Flashcards: ${e.message}`);
                    }
                }

                if (role === 'teacher') {
                    console.log('  🔍 Checking Teacher Features...');

                    // Subjects
                    const subjects = await axios.get(`${API_URL}/subjects`, config);
                    fullDataExport.features.teacher_subjects = subjects.data.data;
                    console.log(`    ✅ Subjects: ${subjects.data.data?.length || 0} available`);

                    // Notes
                    const notes = await axios.get(`${API_URL}/notes`, config);
                    fullDataExport.features.teacher_notes = notes.data.data;
                    console.log(`    ✅ Notes: ${notes.data.data?.length || 0} uploaded`);
                }

                if (role === 'admin') {
                    console.log('  🔍 Checking Admin Features...');

                    // Announcements
                    const announcements = await axios.get(`${API_URL}/announcements`, config);
                    fullDataExport.features.admin_announcements = announcements.data.data;
                    console.log(`    ✅ Announcements: ${announcements.data.data?.length || 0} active`);

                    // Create a test announcement
                    try {
                        await axios.post(`${API_URL}/announcements`, {
                            title: "System Verification Test",
                            message: "This is a test announcement from the verification script.",
                            type: "general",
                            priority: "low",
                            targetAudience: "all"
                        }, config);
                        console.log(`    ✅ Created test announcement`);
                    } catch (e) {
                        console.warn(`    ⚠️ Failed to create announcement: ${e.message}`);
                    }
                }

            } catch (roleError) {
                console.error(`  ❌ Failed verification for ${role}: ${roleError.message}`);
            }
        }

        // 3. Export Data
        fs.writeFileSync(EXPORT_FILE, JSON.stringify(fullDataExport, null, 2));
        console.log(`\n💾 All feature data successfully exported to ${EXPORT_FILE}`);
        console.log('✅ FULL SYSTEM VERIFICATION COMPLETE');

    } catch (error) {
        console.error(`\n❌ Verification Failed:`, error.message);
    }
}

runVerification();
