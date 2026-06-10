const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, '../public')));

// In-Memory Data Store (seeded with some realistic sample data)
const patients = [
  {
    id: 1,
    name: "Elena Rostova",
    phone: "+1 555-0199",
    email: "elena.r@example.com",
    location: "Boston, MA",
    assistanceType: "Cardiology Assistance",
    description: "I am experiencing frequent chest tightness and high blood pressure. I cannot afford the specialist consultation fee and need guidance on getting checked by a cardiologist and assistance with medicine costs.",
    summary: "Patient reports frequent chest tightness and hypertension, requiring a cardiology consultation. She needs financial assistance for medicine costs and specialist checkup fees.",
    status: "Pending Review",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  },
  {
    id: 2,
    name: "Marcus Vance",
    phone: "+1 555-0182",
    email: "marcus.v@example.com",
    location: "Chicago, IL",
    assistanceType: "Pediatric Support",
    description: "My 6-year-old son has persistent asthma attacks. The winter season is making it worse. We cannot afford the monthly inhaler refills and need support from a local clinic or healthcare donor.",
    summary: "Patient requests pediatric assistance for a 6-year-old child suffering from winter-induced asthma attacks. The family needs help acquiring inhaler refills.",
    status: "Volunteer Assigned",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  }
];

const volunteers = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    phone: "+1 555-0177",
    email: "sarah.j@example.com",
    skills: "Cardiology, General Medicine",
    availability: "Weekends Only",
    city: "Boston",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
  },
  {
    id: 2,
    name: "David Miller",
    phone: "+1 555-0165",
    email: "david.m@example.com",
    skills: "Nursing Care, Pediatric Care",
    availability: "Weekdays Evening",
    city: "Chicago",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: 3,
    name: "Priya Sharma",
    phone: "+1 555-0112",
    email: "priya.s@example.com",
    skills: "Patient Coordination, Languages (Spanish)",
    availability: "Flexible Hours",
    city: "New York",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString() // 8 hours ago
  }
];

const contacts = [
  {
    id: 1,
    name: "Robert Dow",
    email: "robert.d@example.com",
    message: "Hi, I would like to organize a corporate donation drive for medicines. Who should I contact in your management team?",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

// Gemini Configuration
let genAI = null;
const API_KEY = process.env.GEMINI_API_KEY;
if (API_KEY && API_KEY !== 'your_gemini_api_key_here') {
  console.log("Gemini API key detected. Using real Gemini AI service.");
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing or placeholder. Running in Mock AI Fallback mode.");
}

// Helper: Summarize Patient Request using Gemini API
async function generateSummary(description) {
  if (!genAI) {
    // Elegant fallback summary matching requested format (2-3 sentences)
    return `The patient is requesting medical assistance. The described issue outlines a medical concern regarding: "${description.length > 80 ? description.substring(0, 80) + '...' : description}". Additional administrative followup is required to assess eligibility and assign a specialized volunteer.`;
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Summarize the following patient healthcare request into exactly 2 or 3 concise sentences. Focus on the medical condition, symptoms, and the type of assistance needed. Do not include introductory text like 'Here is a summary:', just return the summary.\n\nPatient Request: "${description}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini Summarization Error:", error);
    return `Patient has requested support for: "${description.substring(0, 100)}...". Summarization failed due to an API error, please review full description.`;
  }
}

// Helper: Mock FAQ responses for local testing or when API key is missing
function getMockChatbotResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes('request') || (msg.includes('how') && (msg.includes('support') || msg.includes('help') || msg.includes('medical')))) {
    return "To request healthcare support, please go to the 'Request Support' section of our portal. Fill out the form with your name, contact details, location, type of assistance needed, and a description of your medical issue. Once submitted, our system will use AI to summarize your request and notify our team. A volunteer will contact you shortly.";
  }
  if (msg.includes('volunteer') || msg.includes('become') || msg.includes('join')) {
    return "We are always looking for passionate volunteers! To register, please go to the 'Become a Volunteer' section on our portal and fill out the form. You can specify your medical/non-medical skills, availability, and city. We will match you with patients or events in your area.";
  }
  if (msg.includes('document') || msg.includes('paper') || msg.includes('require')) {
    return "To process your healthcare request, we generally require: (1) A valid government-issued ID card, (2) Recent medical reports or prescriptions from a registered physician, and (3) An income certificate or proof of financial need (for subsidized surgical support). Our coordinators will ask for these during the verification call.";
  }
  if (msg.includes('how') && msg.includes('ngo') && msg.includes('help')) {
    return "CareNet NGO assists patients by providing free health camps, sponsoring essential medicines, coordinating surgeries with partner hospitals, and connecting patients with volunteer doctors. We also offer guidance on government health schemes.";
  }
  if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('immediate') || msg.includes('ambulance')) {
    return "EMERGENCY WARNING: If you are experiencing a life-threatening medical emergency, please do not wait for this portal. Immediately call your local emergency services (like 911 or 112) or visit the nearest hospital emergency room.";
  }
  if (msg.includes('contact') || msg.includes('phone') || msg.includes('number') || msg.includes('email')) {
    return "You can reach us via the Contact section at the bottom of this page, or email us directly at support@carenetngo.org. For urgent queries, our helpline is active at +1 (800) 555-CARE from 9 AM to 6 PM.";
  }

  if (msg.includes('working hours') || msg.includes('hours')) {
    return "Our volunteers typically operate between 9 AM and 6 PM. Availability may vary depending on the volunteer and healthcare program.";
  }

  if (msg.includes('remote')) {
    return "Yes, some volunteer roles such as patient coordination, fundraising, and awareness campaigns can be performed remotely.";
  }

  if (msg.includes('donation') || msg.includes('donate')) {
    return "We accept donations for medicines, health camps, and patient assistance programs. Please contact our NGO team for donation details.";
  }

  return `I can help with:
• Healthcare support requests
• Volunteer registration
• Required documents
• Emergency contacts
• Donations
• Working hours
• NGO services

Please ask a more specific question.`;
}
// API Routes

// 1. GET Stats
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    patientsHelped: 120 + patients.length, // seed + new
    volunteersRegistered: volunteers.length,
    requestsHandled: patients.length + contacts.length
  });
});

// 2. POST Patient Request
app.post('/api/patients', async (req, res) => {
  try {
    const { name, phone, email, location, assistanceType, description } = req.body;

    // Validation
    if (!name || !phone || !email || !location || !assistanceType || !description) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Call Gemini AI for request summary
    const summary = await generateSummary(description);

    const newRequest = {
      id: patients.length + 1,
      name,
      phone,
      email,
      location,
      assistanceType,
      description,
      summary,
      status: "Pending Review",
      createdAt: new Date().toISOString()
    };

    patients.push(newRequest);

    res.status(201).json({
      success: true,
      message: "Your healthcare request has been submitted successfully.",
      data: newRequest
    });
  } catch (error) {
    console.error("Patient request error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 3. POST Volunteer Registration
app.post('/api/volunteers', (req, res) => {
  try {
    const { name, phone, email, skills, availability, city } = req.body;

    // Validation
    if (!name || !phone || !email || !skills || !availability || !city) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newVolunteer = {
      id: volunteers.length + 1,
      name,
      phone,
      email,
      skills,
      availability,
      city,
      createdAt: new Date().toISOString()
    };

    volunteers.push(newVolunteer);

    res.status(201).json({
      success: true,
      message: "Thank you for registering as a volunteer!",
      data: newVolunteer
    });
  } catch (error) {
    console.error("Volunteer registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 4. POST Contact Submission
app.post('/api/contacts', (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newContact = {
      id: contacts.length + 1,
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    };

    contacts.push(newContact);

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We will contact you soon."
    });
  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 5. GET Admin Data
app.get('/api/admin/data', (req, res) => {
  res.json({
    success: true,
    patients: patients.slice().reverse(), // recent first
    volunteers: volunteers.slice().reverse(),
    contacts: contacts.slice().reverse()
  });
});

// 6. POST Chatbot Interaction
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    let responseText = "";

    if (!genAI) {
      // Mock FAQ logic
      responseText = getMockChatbotResponse(message);
    } else {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: `You are an AI FAQ assistant for CareNet, a healthcare support NGO. Your goal is to help patients, volunteers, and donors find information.
Respond professionally, empathetically, and concisely (under 4-5 sentences).
If someone asks about how to request support, explain they should navigate to the "Request Support" section and submit the form.
If they ask how to volunteer, tell them to register under the "Become a Volunteer" section.
If they ask about documents required, explain that standard ID proof, income certificates (if applicable), and medical prescriptions/reports are requested.
If they ask how NGOs help patients, explain we provide free checkups, coordinate treatments, sponsor medicines, and match volunteer doctors.
For emergencies, emphasize that they should dial local emergency numbers (like 911 or 112) or go to the nearest hospital, as this portal is not for immediate medical emergencies.
Answer general queries but redirect specific medical diagnoses to professional doctors.`
        });

        // Map frontend chat history format to Gemini parts
        const formattedHistory = [];
        if (history && Array.isArray(history)) {
          const recentHistory = history.slice(-6);
          recentHistory.forEach(msg => {
            formattedHistory.push({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            });
          });
        }

        const chat = model.startChat({
          history: formattedHistory
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        responseText = response.text().trim();
      } catch (geminiError) {
        console.error("Gemini chatbot connection failed:", geminiError);

        if (geminiError.status === 429) {
          responseText = getMockChatbotResponse(message);
        } else {
          responseText = getMockChatbotResponse(message);
        }
      }
    }

    res.json({
      success: true,
      reply: responseText
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// For any other GET request, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
