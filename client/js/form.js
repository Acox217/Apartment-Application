// Point to your API (local dev vs deployed)
    const API_BASE = ''; 

    const formEl = document.getElementById('applicationForm');
    const errorEl = document.getElementById('error');
    const stepForm = document.getElementById('step-form');
    const stepConfirmation = document.getElementById('step-confirmation');
    const summaryEl = document.getElementById('summary');
    const submitBtn = document.getElementById('submitBtn');

    // Bootstrap validation styling
    (() => {
      formEl.addEventListener('submit', (event) => {
        if (!formEl.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        formEl.classList.add('was-validated');
      }, false);
    })();

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!formEl.checkValidity()) return;

      errorEl.classList.add('d-none');
      submitBtn.disabled = true;

      const data = Object.fromEntries(new FormData(formEl).entries());

      try {
        const res = await fetch(`${API_BASE}/api/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || 'Submission failed');

        // Success → show confirmation card
        stepForm.classList.add('d-none');
        stepConfirmation.classList.remove('d-none');
        summaryEl.textContent = JSON.stringify(payload.submission, null, 2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        errorEl.textContent = err.message || 'Something went wrong.';
        errorEl.classList.remove('d-none');
      } finally {
        submitBtn.disabled = false;
      }
    });