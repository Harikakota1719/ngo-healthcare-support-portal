// Default Seed Data for Standalone Browser-Demo Mode
const defaultPatients = [
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

const defaultVolunteers = [
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

// App Connectivity Mode Flag
let useLocalMock = false;

// Probe backend server or fallback to browser-only mock mode
async function checkServerConnection() {
  try {
    const response = await fetch('/api/stats');
    const data = await response.json();
    if (data.success) {
      console.log("Connected to Express Backend. Running in Live Mode.");
      useLocalMock = false;
      const statusPill = document.querySelector('.dashboard-status-pill');
      if (statusPill) {
        statusPill.innerHTML = `<i class="fa-solid fa-circle-check"></i> Connected (Live Server)`;
      }
    }
  } catch (error) {
    console.warn("Express server not active or opened via file://. Running in Standalone Browser-Demo Mode.");
    useLocalMock = true;
    initializeLocalStorage();
    const statusPill = document.querySelector('.dashboard-status-pill');
    if (statusPill) {
      statusPill.innerHTML = `<i class="fa-solid fa-circle-info"></i> Browser-Demo Mode`;
      statusPill.style.backgroundColor = 'var(--accent-glow)';
      statusPill.style.color = 'var(--accent)';
    }
  }
}

// Initialize localStorage seed values for Demo Mode
function initializeLocalStorage() {
  if (!localStorage.getItem('patients')) {
    localStorage.setItem('patients', JSON.stringify(defaultPatients));
  }
  if (!localStorage.getItem('volunteers')) {
    localStorage.setItem('volunteers', JSON.stringify(defaultVolunteers));
  }
  if (!localStorage.getItem('contacts')) {
    localStorage.setItem('contacts', JSON.stringify([]));
  }
}

// Central Request Router
async function makeRequest(url, options = {}) {
  if (useLocalMock) {
    return handleMockRequest(url, options);
  }
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Server error occurred.");
    }
    return await response.json();
  } catch (error) {
    // If the server connection fails, fallback to local storage
    if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
      console.warn("Express server disconnected. Switched to Browser-Demo Mode.");
      useLocalMock = true;
      initializeLocalStorage();
      showToast("Server disconnected. Switched to browser demo mode.", "info");
      
      const statusPill = document.querySelector('.dashboard-status-pill');
      if (statusPill) {
        statusPill.innerHTML = `<i class="fa-solid fa-circle-info"></i> Browser-Demo Mode`;
        statusPill.style.backgroundColor = 'var(--accent-glow)';
        statusPill.style.color = 'var(--accent)';
      }
      return handleMockRequest(url, options);
    }
    throw error;
  }
}

// Client-Side Mock Database Handler
function handleMockRequest(url, options) {
  const method = options.method || 'GET';
  
  // 1. GET /api/stats
  if (url.includes('/api/stats') && method === 'GET') {
    const p = JSON.parse(localStorage.getItem('patients') || '[]');
    const v = JSON.parse(localStorage.getItem('volunteers') || '[]');
    const c = JSON.parse(localStorage.getItem('contacts') || '[]');
    return {
      success: true,
      patientsHelped: 120 + p.length,
      volunteersRegistered: v.length,
      requestsHandled: p.length + c.length
    };
  }

  // 2. POST /api/patients
  if (url.includes('/api/patients') && method === 'POST') {
    const body = JSON.parse(options.body);
    const p = JSON.parse(localStorage.getItem('patients') || '[]');
    
    // Simulate Gemini summary generation (2-3 sentences)
    const summary = `Patient is seeking assistance for ${body.assistanceType} in ${body.location}. The issue describes: "${body.description.length > 90 ? body.description.substring(0, 90) + '...' : body.description}". This case requires coordinator intake.`;
    
    const newPatient = {
      id: p.length + 1,
      name: body.name,
      phone: body.phone,
      email: body.email,
      location: body.location,
      assistanceType: body.assistanceType,
      description: body.description,
      summary: summary,
      status: "Pending Review",
      createdAt: new Date().toISOString()
    };
    
    p.push(newPatient);
    localStorage.setItem('patients', JSON.stringify(p));
    
    return {
      success: true,
      message: "Your healthcare request has been submitted successfully (Saved to browser storage).",
      data: newPatient
    };
  }

  // 3. POST /api/volunteers
  if (url.includes('/api/volunteers') && method === 'POST') {
    const body = JSON.parse(options.body);
    const v = JSON.parse(localStorage.getItem('volunteers') || '[]');
    
    const newVolunteer = {
      id: v.length + 1,
      name: body.name,
      phone: body.phone,
      email: body.email,
      skills: body.skills,
      availability: body.availability,
      city: body.city,
      createdAt: new Date().toISOString()
    };
    
    v.push(newVolunteer);
    localStorage.setItem('volunteers', JSON.stringify(v));
    
    return {
      success: true,
      message: "Thank you for registering as a volunteer! (Saved to browser storage)",
      data: newVolunteer
    };
  }

  // 4. POST /api/contacts
  if (url.includes('/api/contacts') && method === 'POST') {
    const body = JSON.parse(options.body);
    const c = JSON.parse(localStorage.getItem('contacts') || '[]');
    
    const newContact = {
      id: c.length + 1,
      name: body.name,
      email: body.email,
      message: body.message,
      createdAt: new Date().toISOString()
    };
    
    c.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(c));
    
    return {
      success: true,
      message: "Your message has been sent successfully. (Saved to browser storage)"
    };
  }

  // 5. GET /api/admin/data
  if (url.includes('/api/admin/data') && method === 'GET') {
    const p = JSON.parse(localStorage.getItem('patients') || '[]');
    const v = JSON.parse(localStorage.getItem('volunteers') || '[]');
    const c = JSON.parse(localStorage.getItem('contacts') || '[]');
    
    return {
      success: true,
      patients: p.slice().reverse(),
      volunteers: v.slice().reverse(),
      contacts: c.slice().reverse()
    };
  }

  // 6. POST /api/chat
  if (url.includes('/api/chat') && method === 'POST') {
    const body = JSON.parse(options.body);
    const reply = getClientMockFAQResponse(body.message);
    
    return {
      success: true,
      reply: reply
    };
  }

  return { success: false, message: "Endpoint not found." };
}

// Client-Side Chatbot Keyword FAQ Responder
function getClientMockFAQResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('request') || (msg.includes('how') && (msg.includes('support') || msg.includes('help') || msg.includes('medical')))) {
    return "To request healthcare support, please go to the 'Request Support' section of our portal. Fill out the form with your name, contact details, location, type of assistance needed, and a description of your medical issue. Once submitted, our system will generate a summary for our review panel and contact you.";
  }
  if (msg.includes('volunteer') || msg.includes('become') || msg.includes('join')) {
    return "We are always looking for passionate volunteers! Go to the 'Become a Volunteer' section on our portal and fill out the registration form. You can select your skills, availability, and city. We will match you with patients in your area.";
  }
  if (msg.includes('document') || msg.includes('paper') || msg.includes('require')) {
    return "To process request applications, we generally require: (1) A valid government-issued ID card, (2) Recent medical reports or prescriptions from a registered physician, and (3) An income certificate or proof of financial need (for surgical support sponsorships). Our team will ask you for these during follow-up calls.";
  }
  if (msg.includes('how') && msg.includes('ngo') && msg.includes('help')) {
    return "CareNet NGO assists patients by providing free health camps, sponsoring essential medicines, coordinating surgeries with partner hospitals, and connecting patients with volunteer doctors. We also offer guidance on government health schemes.";
  }
  if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('immediate') || msg.includes('ambulance')) {
    return "EMERGENCY WARNING: If you are experiencing a life-threatening medical emergency, please do not wait. Immediately call your local emergency services (like 911 or 112) or visit the nearest hospital emergency room.";
  }
  if (msg.includes('contact') || msg.includes('phone') || msg.includes('number') || msg.includes('email')) {
    return "You can reach us via the Contact section at the bottom of this page, or email us directly at support@carenetngo.org. For urgent queries, our helpline is active at +1 (800) 555-CARE from 9 AM to 6 PM.";
  }
  
  return "Thank you for contacting CareNet NGO. I can assist with answering questions regarding: requesting medical support, volunteering registration, required application documents, and emergency advice. What can I help you find today?";
}

// Navigation Menu Controls
function toggleMenu() {
  const menu = document.getElementById('nav-menu');
  const hamburger = document.getElementById('hamburger');
  menu.classList.toggle('active');
  hamburger.classList.toggle('active');
}

function closeMenu() {
  const menu = document.getElementById('nav-menu');
  const hamburger = document.getElementById('hamburger');
  menu.classList.remove('active');
  hamburger.classList.remove('active');
}

// Active Nav Link Highlighting on Scroll
window.addEventListener('DOMContentLoaded', async () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  const options = {
    root: null,
    threshold: 0.3,
    rootMargin: "-80px 0px 0px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, options);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Probe server connection to decide mode, then load data
  await checkServerConnection();
  fetchStats();
  fetchAdminData();
});

// Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass = type === 'success' 
    ? 'fa-solid fa-circle-check' 
    : type === 'error' 
      ? 'fa-solid fa-circle-exclamation' 
      : 'fa-solid fa-circle-info';

  toast.innerHTML = `
    <i class="${iconClass}"></i>
    <div class="toast-content">${message}</div>
    <i class="fa-solid fa-xmark toast-close" onclick="this.parentElement.remove()"></i>
  `;

  container.appendChild(toast);

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.style.animation = 'slide-out 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4500);
}

// Button Loading State Toggler
function toggleLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  
  if (isLoading) {
    btn.disabled = true;
    if (text) text.classList.add('hidden');
    if (spinner) spinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    if (text) text.classList.remove('hidden');
    if (spinner) spinner.classList.add('hidden');
  }
}

// 1. Fetch Stats Counter
async function fetchStats() {
  try {
    const data = await makeRequest('/api/stats');
    if (data.success) {
      document.getElementById('stat-patients').innerText = data.patientsHelped;
      document.getElementById('stat-volunteers').innerText = data.volunteersRegistered;
      document.getElementById('stat-requests').innerText = data.requestsHandled;
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
}

// Helper: Form Validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return phone.replace(/\D/g, '').length >= 7;
}

// 2. Patient Form Handler
async function handlePatientSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('p-name').value.trim();
  const phone = document.getElementById('p-phone').value.trim();
  const email = document.getElementById('p-email').value.trim();
  const location = document.getElementById('p-location').value.trim();
  const assistanceType = document.getElementById('p-type').value;
  const description = document.getElementById('p-desc').value.trim();

  // Validate inputs
  if (!name || !phone || !email || !location || !assistanceType || !description) {
    showToast("Please fill out all required fields.", "error");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  if (!validatePhone(phone)) {
    showToast("Please enter a valid phone number.", "error");
    return;
  }

  toggleLoading('patient-submit-btn', true);

  try {
    const data = await makeRequest('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, location, assistanceType, description })
    });
    
    if (data.success) {
      showToast(data.message, "success");
      document.getElementById('patient-form').reset();
      
      // Refresh UI values
      fetchStats();
      fetchAdminData();
      
      // Auto scroll to admin section
      setTimeout(() => {
        const adminSec = document.getElementById('admin-dashboard');
        if (adminSec) adminSec.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    } else {
      showToast(data.message || "Failed to submit request.", "error");
    }
  } catch (error) {
    console.error("Patient submit error:", error);
    showToast("Server connection error.", "error");
  } finally {
    toggleLoading('patient-submit-btn', false);
  }
}

// 3. Volunteer Form Handler
async function handleVolunteerSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('v-name').value.trim();
  const phone = document.getElementById('v-phone').value.trim();
  const email = document.getElementById('v-email').value.trim();
  const city = document.getElementById('v-city').value.trim();
  const availability = document.getElementById('v-availability').value;
  const skills = document.getElementById('v-skills').value.trim();

  if (!name || !phone || !email || !city || !availability || !skills) {
    showToast("Please fill out all required fields.", "error");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  if (!validatePhone(phone)) {
    showToast("Please enter a valid phone number.", "error");
    return;
  }

  toggleLoading('volunteer-submit-btn', true);

  try {
    const data = await makeRequest('/api/volunteers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, city, availability, skills })
    });

    if (data.success) {
      showToast(data.message, "success");
      document.getElementById('volunteer-form').reset();
      
      // Refresh values
      fetchStats();
      fetchAdminData();
    } else {
      showToast(data.message || "Failed to register.", "error");
    }
  } catch (error) {
    console.error("Volunteer submit error:", error);
    showToast("Server connection error.", "error");
  } finally {
    toggleLoading('volunteer-submit-btn', false);
  }
}

// 4. Contact Form Handler
async function handleContactSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const message = document.getElementById('c-message').value.trim();

  if (!name || !email || !message) {
    showToast("Please fill out all fields.", "error");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    return;
  }

  toggleLoading('contact-submit-btn', true);

  try {
    const data = await makeRequest('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (data.success) {
      showToast(data.message, "success");
      document.getElementById('contact-form').reset();
      fetchStats();
    } else {
      showToast(data.message || "Failed to send message.", "error");
    }
  } catch (error) {
    console.error("Contact submit error:", error);
    showToast("Server connection error.", "error");
  } finally {
    toggleLoading('contact-submit-btn', false);
  }
}

// 5. AI Chatbot Logic
let chatHistory = [];

function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

function appendMessage(sender, text) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `message message-${sender}`;
  
  const timeStr = formatTime(new Date());

  msgDiv.innerHTML = `
    <div class="message-bubble">${escapeHTML(text)}</div>
    <span class="message-time">${timeStr}</span>
  `;

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Save history
  chatHistory.push({ sender, text });
}

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function handleChatSubmit(event) {
  if (event) event.preventDefault();

  const chatInput = document.getElementById('chat-input');
  if (!chatInput) return;

  const message = chatInput.value.trim();
  if (!message) return;

  chatInput.value = '';
  appendMessage('user', message);

  // Show typing loader
  const typingIndicator = document.getElementById('chat-typing');
  if (typingIndicator) {
    typingIndicator.classList.remove('hidden');
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Simulate typing delay for AI feel
  setTimeout(async () => {
    try {
      const data = await makeRequest('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: chatHistory.slice(0, -1)
        })
      });

      if (typingIndicator) typingIndicator.classList.add('hidden');

      if (data.success) {
        appendMessage('bot', data.reply);
      } else {
        appendMessage('bot', "I'm sorry, I encountered an issue generating a reply. Please try again.");
      }
    } catch (error) {
      console.error("Chatbot API error:", error);
      if (typingIndicator) typingIndicator.classList.add('hidden');
      appendMessage('bot', "I seem to be disconnected from my brain. Please try again.");
    }
  }, 750);
}

function sendQuickMessage(text) {
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.value = text;
    handleChatSubmit();
  }
}

// 6. Admin Panel / Dashboard Logic
function switchAdminTab(tabName) {
  const pBtn = document.getElementById('tab-btn-patients');
  const vBtn = document.getElementById('tab-btn-volunteers');
  const pContent = document.getElementById('tab-content-patients');
  const vContent = document.getElementById('tab-content-volunteers');

  if (tabName === 'patients') {
    pBtn.classList.add('active');
    vBtn.classList.remove('active');
    pContent.classList.add('active');
    vContent.classList.remove('active');
  } else {
    vBtn.classList.add('active');
    pBtn.classList.remove('active');
    vContent.classList.add('active');
    pContent.classList.remove('active');
  }
}

async function fetchAdminData() {
  try {
    const data = await makeRequest('/api/admin/data');

    if (data.success) {
      renderAdminPatients(data.patients);
      renderAdminVolunteers(data.volunteers);
      
      // Update badge counts on tabs
      document.getElementById('dash-patient-count').innerText = data.patients.length;
      document.getElementById('dash-volunteer-count').innerText = data.volunteers.length;
    }
  } catch (error) {
    console.error("Admin data fetch error:", error);
  }
}

function renderAdminPatients(patientsList) {
  const tbody = document.getElementById('admin-patients-body');
  if (!tbody) return;

  if (patientsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px 0;">No patient requests received yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = patientsList.map(p => {
    const dateFormatted = new Date(p.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const statusClass = p.status === 'Volunteer Assigned' ? 'status-assigned' : 'status-pending';

    return `
      <tr>
        <td>
          <div class="cell-primary">${escapeHTML(p.name)}</div>
          <div class="cell-subtext"><i class="fa-solid fa-phone"></i> ${escapeHTML(p.phone)}</div>
          <div class="cell-subtext"><i class="fa-solid fa-envelope"></i> ${escapeHTML(p.email)}</div>
          <div class="cell-subtext" style="font-size: 11px;"><i class="fa-solid fa-clock"></i> ${dateFormatted}</div>
        </td>
        <td>
          <div class="cell-primary">${escapeHTML(p.assistanceType)}</div>
          <div class="cell-subtext"><i class="fa-solid fa-location-dot"></i> ${escapeHTML(p.location)}</div>
        </td>
        <td>
          <div class="summary-bubble">
            "${escapeHTML(p.summary)}"
          </div>
          <details style="margin-top: 8px; font-size: 12px; color: var(--text-muted); cursor: pointer;">
            <summary>View Full Description</summary>
            <p style="margin-top: 6px; padding-left: 8px; border-left: 2px solid var(--border-color); white-space: pre-wrap;">${escapeHTML(p.description)}</p>
          </details>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${escapeHTML(p.status)}</span>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAdminVolunteers(volunteersList) {
  const tbody = document.getElementById('admin-volunteers-body');
  if (!tbody) return;

  if (volunteersList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px 0;">No volunteers registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = volunteersList.map(v => {
    return `
      <tr>
        <td>
          <div class="cell-primary">${escapeHTML(v.name)}</div>
          <div class="cell-subtext"><i class="fa-solid fa-phone"></i> ${escapeHTML(v.phone)}</div>
          <div class="cell-subtext"><i class="fa-solid fa-envelope"></i> ${escapeHTML(v.email)}</div>
        </td>
        <td class="cell-primary">
          ${escapeHTML(v.city)}
        </td>
        <td>
          <span style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; border: 1px solid var(--border-color);">
            ${escapeHTML(v.skills)}
          </span>
        </td>
        <td>
          <div class="cell-primary" style="font-size: 13px; color: var(--accent);"><i class="fa-solid fa-calendar-check"></i> ${escapeHTML(v.availability)}</div>
        </td>
      </tr>
    `;
  }).join('');
}
