/**
 * Integration Test Script for NGO Healthcare Support Portal API
 * Runs a local server instance and sends HTTP requests to verify API routes.
 */

const app = require('./api/index');
const PORT = 3001; // use separate port for testing

let server;

async function runTests() {
  console.log("--------------------------------------------------");
  console.log("🚀 Starting NGO Healthcare Portal API Verification");
  console.log("--------------------------------------------------");
  
  // Start server
  server = app.listen(PORT, async () => {
    console.log(`Test server active on http://localhost:${PORT}`);
    
    try {
      let passed = true;

      // Test 1: GET /api/stats
      console.log("\n🧪 Test 1: GET /api/stats...");
      const statsRes = await fetch(`http://localhost:${PORT}/api/stats`);
      const stats = await statsRes.json();
      console.log("Response:", stats);
      if (statsRes.status === 200 && stats.success && stats.volunteersRegistered === 3) {
        console.log("✅ Test 1 Passed!");
      } else {
        console.error("❌ Test 1 Failed!");
        passed = false;
      }

      // Test 2: POST /api/patients (Register Patient and check summary generation)
      console.log("\n🧪 Test 2: POST /api/patients...");
      const patientPayload = {
        name: "Test Patient",
        phone: "+1 555-9999",
        email: "test.p@example.com",
        location: "Seattle, WA",
        assistanceType: "General Health Consultation",
        description: "I have had a severe sore throat and moderate fever for three days. I need assistance getting a doctor checkup and obtaining antibiotics since I currently have no health insurance."
      };
      
      const patientRes = await fetch(`http://localhost:${PORT}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientPayload)
      });
      const patient = await patientRes.json();
      console.log("Response Status:", patientRes.status);
      console.log("Generated Summary:", patient.data?.summary);
      if (patientRes.status === 201 && patient.success && patient.data.summary) {
        console.log("✅ Test 2 Passed!");
      } else {
        console.error("❌ Test 2 Failed!");
        passed = false;
      }

      // Test 3: POST /api/volunteers (Register Volunteer)
      console.log("\n🧪 Test 3: POST /api/volunteers...");
      const volunteerPayload = {
        name: "Test Volunteer",
        phone: "+1 555-8888",
        email: "test.v@example.com",
        skills: "Pediatric Consultation",
        availability: "Flexible Hours",
        city: "Seattle"
      };

      const volunteerRes = await fetch(`http://localhost:${PORT}/api/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteerPayload)
      });
      const volunteer = await volunteerRes.json();
      console.log("Response:", volunteer);
      if (volunteerRes.status === 201 && volunteer.success) {
        console.log("✅ Test 3 Passed!");
      } else {
        console.error("❌ Test 3 Failed!");
        passed = false;
      }

      // Test 4: POST /api/chat (Test AI Chatbot response)
      console.log("\n🧪 Test 4: POST /api/chat...");
      const chatPayload = {
        message: "What documents are required to get patient help?",
        history: []
      };

      const chatRes = await fetch(`http://localhost:${PORT}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload)
      });
      const chat = await chatRes.json();
      console.log("AI/Mock Reply:", chat.reply);
      if (chatRes.status === 200 && chat.success && chat.reply) {
        console.log("✅ Test 4 Passed!");
      } else {
        console.error("❌ Test 4 Failed!");
        passed = false;
      }

      // Test 5: GET /api/admin/data (Verify data has been stored in memory)
      console.log("\n🧪 Test 5: GET /api/admin/data...");
      const adminRes = await fetch(`http://localhost:${PORT}/api/admin/data`);
      const adminData = await adminRes.json();
      console.log("Patient count stored:", adminData.patients.length);
      console.log("Volunteer count stored:", adminData.volunteers.length);
      if (adminRes.status === 200 && adminData.success && adminData.patients.length === 3 && adminData.volunteers.length === 4) {
        console.log("✅ Test 5 Passed!");
      } else {
        console.error("❌ Test 5 Failed!");
        passed = false;
      }

      console.log("\n--------------------------------------------------");
      if (passed) {
        console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
        shutdown(0);
      } else {
        console.error("🚨 SOME TESTS FAILED. CHECK LOGS.");
        shutdown(1);
      }

    } catch (err) {
      console.error("❌ Unexpected test execution error:", err);
      shutdown(1);
    }
  });
}

function shutdown(exitCode) {
  if (server) {
    server.close(() => {
      console.log("Test server shut down.");
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
}

runTests();
