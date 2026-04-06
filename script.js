/* ============================================
   KISMAT EVENT PAGE — SCRIPT
   ============================================ */

// ─── CONFIG ───────────────────────────────────────
// Replace these with your actual Supabase credentials before deploying
const SUPABASE_URL = 'https://cawsovrvarplajnkuzut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd3NvdnJ2YXJwbGFqbmt1enV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NDg4MjksImV4cCI6MjA5MTAyNDgyOX0.LsnIBL5476wlevHg0LPFJ4PLdRe_iKEdH07kjs8swd8';

const EVENT_SLUG = 'event_name'; // unique slug for this event
const PAYMENT_UPI_ID = '7874864063@fam';
const STORAGE_BUCKET = 'payment-screenshots';

// ─── SUPABASE CLIENT ──────────────────────────────
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── STATE ────────────────────────────────────────
let registrationId = null;
let screenshotFile = null;

// ─── PARTICLES ────────────────────────────────────
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = Math.min(30, Math.floor(window.innerWidth / 40));
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = (60 + Math.random() * 40) + '%';
    p.style.animationDelay = (Math.random() * 8) + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    const colors = ['#00f0ff', '#ff2d95', '#b44dff', '#ffd700'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
})();

// ─── SMOOTH SCROLL ────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─── TOAST ────────────────────────────────────────
function showToast(message, type) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast ' + (type || '');
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── COPY UPI ─────────────────────────────────────
function copyUPI() {
  navigator.clipboard.writeText(PAYMENT_UPI_ID).then(() => {
    showToast('UPI ID copied!', 'success');
    const btn = document.getElementById('copyUpiBtn');
    if (btn) {
      btn.textContent = 'COPIED!';
      setTimeout(() => { btn.textContent = 'COPY UPI'; }, 2000);
    }
  }).catch(() => {
    const input = document.createElement('input');
    input.value = PAYMENT_UPI_ID;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('UPI ID copied!', 'success');
  });
}

// ─── FORM VALIDATION ──────────────────────────────
function validateForm() {
  let valid = true;
  clearErrors();

  const name = document.getElementById('regName').value.trim();
  const age = parseInt(document.getElementById('regAge').value, 10);
  const gender = document.getElementById('regGender').value;
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();

  if (!name || name.length < 2) {
    setError('regName', 'errorName', 'Please enter your full name');
    valid = false;
  }

  if (!age || age < 18) {
    setError('regAge', 'errorAge', 'You must be 18 or older');
    valid = false;
  } else if (age > 99) {
    setError('regAge', 'errorAge', 'Please enter a valid age');
    valid = false;
  }

  if (!gender) {
    setError('regGender', 'errorGender', 'Please select your gender');
    valid = false;
  }

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    setError('regPhone', 'errorPhone', 'Enter a valid 10-digit Indian phone number');
    valid = false;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError('regEmail', 'errorEmail', 'Enter a valid email address');
    valid = false;
  }

  return valid;
}

function setError(inputId, errorId, msg) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) {
    error.textContent = msg;
    error.classList.add('active');
  }
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('active');
  });
  document.querySelectorAll('input.error, select.error').forEach(el => {
    el.classList.remove('error');
  });
}

// ─── FORM SUBMIT ──────────────────────────────────
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('submitBtnText');
  const spinner = document.getElementById('submitSpinner');
  btn.disabled = true;
  btnText.textContent = 'SUBMITTING...';
  spinner.style.display = 'block';

  const data = {
    event_slug: EVENT_SLUG,
    name: document.getElementById('regName').value.trim(),
    age: parseInt(document.getElementById('regAge').value, 10),
    gender: document.getElementById('regGender').value,
    phone: document.getElementById('regPhone').value.trim(),
    email: document.getElementById('regEmail').value.trim() || null,
    instagram: document.getElementById('regInstagram').value.trim() || null,
    payment_status: 'pending',
  };

  try {
    const { data: row, error } = await sb
      .from('event_registrations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    registrationId = row.id;
    showToast('Details saved! Now complete payment.', 'success');
    showPaymentSection();
  } catch (err) {
    console.error('Registration error:', err);
    showToast('Something went wrong. Please try again.', 'error');
    btn.disabled = false;
    btnText.textContent = 'PROCEED TO PAYMENT';
    spinner.style.display = 'none';
  }
});

function showPaymentSection() {
  document.getElementById('register').style.display = 'none';
  const paySection = document.getElementById('payment');
  paySection.style.display = 'flex';
  paySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── SCREENSHOT UPLOAD ───────────────────────────
const uploadZone = document.getElementById('uploadZone');
const screenshotInput = document.getElementById('screenshotInput');

uploadZone.addEventListener('click', () => screenshotInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = 'var(--cyan)';
  uploadZone.style.background = 'rgba(0, 240, 255, 0.05)';
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.style.borderColor = '';
  uploadZone.style.background = '';
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = '';
  uploadZone.style.background = '';
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

screenshotInput.addEventListener('change', (e) => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('File too large. Max 5 MB.', 'error');
    return;
  }

  screenshotFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('screenshotPreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    preview.src = e.target.result;
    preview.style.display = 'block';
    placeholder.style.display = 'none';

    const btn = document.getElementById('confirmPaymentBtn');
    const txt = document.getElementById('confirmBtnText');
    btn.disabled = false;
    txt.textContent = 'CONFIRM PAYMENT';
  };
  reader.readAsDataURL(file);
}

// ─── SUBMIT PAYMENT ──────────────────────────────
async function submitPayment() {
  if (!screenshotFile || !registrationId) return;

  const btn = document.getElementById('confirmPaymentBtn');
  const btnText = document.getElementById('confirmBtnText');
  const spinner = document.getElementById('paymentSpinner');
  btn.disabled = true;
  btnText.textContent = 'UPLOADING...';
  spinner.style.display = 'block';

  try {
    const ext = screenshotFile.name.split('.').pop();
    const filePath = `${EVENT_SLUG}/${registrationId}.${ext}`;

    const { data: uploadData, error: uploadErr } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, screenshotFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadErr) throw uploadErr;

    const { data: urlData } = sb.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const screenshotUrl = urlData?.publicUrl || filePath;

    const { error: updateErr } = await sb
      .from('event_registrations')
      .update({
        payment_screenshot_url: screenshotUrl,
        payment_status: 'submitted',
      })
      .eq('id', registrationId);

    if (updateErr) throw updateErr;

    showConfirmation();
  } catch (err) {
    console.error('Payment submission error:', err);
    showToast('Upload failed. Please try again.', 'error');
    btn.disabled = false;
    btnText.textContent = 'CONFIRM PAYMENT';
    spinner.style.display = 'none';
  }
}

// ─── SHOW CONFIRMATION ───────────────────────────
function showConfirmation() {
  document.getElementById('payment').style.display = 'none';

  document.getElementById('confirmName').textContent = document.getElementById('regName').value.trim();
  document.getElementById('confirmEvent').textContent = document.getElementById('eventTitle').textContent;
  document.getElementById('confirmDate').textContent = document.getElementById('detailDate').textContent;
  document.getElementById('confirmVenue').textContent = document.getElementById('detailVenue').textContent;

  const section = document.getElementById('confirmation');
  section.style.display = 'flex';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast("You're in! See you there.", 'success');
}

// ─── INTERSECTION OBSERVER (reveal animation) ────
const observerOptions = { threshold: 0.15 };

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.details__card').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
  revealObserver.observe(card);
});
