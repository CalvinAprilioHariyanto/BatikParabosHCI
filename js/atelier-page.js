document.addEventListener('DOMContentLoaded', () => {
  
  // APIs
  const appointmentsAPI = window.appointmentsAPI;
  
  if (!appointmentsAPI) {
    console.error("Required APIs not found. Ensure appointments.js is loaded.");
    return;
  }

  // DOM Elements
  const form = document.getElementById('atelier-reservation-form');
  
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  
  const formStateContainer = document.getElementById('reservation-form-state');
  const confStateContainer = document.getElementById('reservation-confirmation-state');

  // Buttons
  const btnNext1 = document.getElementById('btn-next-1');
  const btnNext2 = document.getElementById('btn-next-2');
  const btnBack2 = document.getElementById('btn-back-2');
  const btnBack3 = document.getElementById('btn-back-3');
  const btnSubmit = document.getElementById('btn-submit');

  // Inputs
  const dateInput = document.getElementById('res-date');
  
  // Set minimum date to tomorrow
  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  dateInput.min = tmrw.toISOString().split('T')[0];

  // Navigation Logic
  btnNext1.addEventListener('click', () => {
    // Validate Step 1 (Experience selected)
    const experienceChecked = form.querySelector('input[name="experience"]:checked');
    if (!experienceChecked) {
      if (window.showToast) window.showToast("Please select an experience.", "error");
      return;
    }
    showStep(step2);
  });

  btnBack2.addEventListener('click', () => showStep(step1));

  btnNext2.addEventListener('click', () => {
    // Validate Step 2 (HTML5 Validation)
    // We add a class to trigger CSS validation styling
    step2.classList.add('was-validated');
    
    // Check specific inputs within step 2 manually since form.checkValidity() checks EVERYTHING
    const inputs = step2.querySelectorAll('input, select');
    let isValid = true;
    inputs.forEach(input => {
      if (!input.checkValidity()) isValid = false;
    });

    if (!isValid) {
      if (window.showToast) window.showToast("Please complete all required fields correctly.", "error");
      return;
    }

    populateReview();
    showStep(step3);
  });

  btnBack3.addEventListener('click', () => showStep(step2));

  function showStep(targetStep) {
    [step1, step2, step3].forEach(step => {
      step.classList.add('hidden');
      step.classList.remove('active');
    });
    targetStep.classList.remove('hidden');
    // Small delay for smooth opacity transition if CSS is setup for it
    setTimeout(() => {
      targetStep.classList.add('active');
    }, 10);
  }

  function populateReview() {
    const formData = new FormData(form);
    
    document.getElementById('review-experience').textContent = formData.get('experience');
    
    // Format date nicely
    const rawDate = formData.get('date');
    const dateObj = new Date(rawDate);
    document.getElementById('review-date').textContent = isNaN(dateObj) ? rawDate : dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'});
    
    document.getElementById('review-time').textContent = formData.get('time');
    document.getElementById('review-guests').textContent = formData.get('guests');
    
    document.getElementById('review-name').textContent = formData.get('name');
    document.getElementById('review-email').textContent = formData.get('email');
    document.getElementById('review-phone').textContent = formData.get('phone');
  }

  // Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Final safety check
    if (!form.checkValidity()) return;

    // Prevent double submission
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Requesting...";

    const formData = new FormData(form);
    const appointmentData = Object.fromEntries(formData.entries());
    
    // Save to appointments API
    try {
      const savedAppointment = appointmentsAPI.saveAppointment(appointmentData);
      showConfirmation(savedAppointment);
    } catch (error) {
      console.error(error);
      if (window.showToast) window.showToast("An error occurred while submitting.", "error");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Request Reservation";
    }
  });

  function showConfirmation(appointment) {
    // Hide form, show confirmation
    formStateContainer.classList.add('hidden');
    confStateContainer.classList.remove('hidden');

    // Populate data
    document.getElementById('conf-id').textContent = appointment.id;
    document.getElementById('conf-exp').textContent = appointment.experience;
    
    const dateObj = new Date(appointment.date);
    document.getElementById('conf-date').textContent = isNaN(dateObj) ? appointment.date : dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'});
    document.getElementById('conf-time').textContent = appointment.time;
    
    // Scroll to top of section
    document.getElementById('reservation-section').scrollIntoView({ behavior: 'smooth' });
  }

});
