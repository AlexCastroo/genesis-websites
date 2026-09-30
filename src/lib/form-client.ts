/**
 * Progressive enhancement for [data-contact-form] forms: without JS they POST normally.
 * With JS they submit via fetch and report the result in their [data-form-status] region.
 * Links with [data-plan] preselect that option in the request form's "interest" select.
 */
import { trackEvent } from './analytics-client';

let initialised = false;

export function initForms(root: Document = document): void {
  if (initialised) return;
  initialised = true;
  root.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
    const status = form.querySelector<HTMLElement>('[data-form-status]');
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');

    // Runs only after native validation passes.
    form.addEventListener('submit', async (event) => {
      if (!status || !submit) return;
      event.preventDefault();
      submit.disabled = true;
      status.dataset.state = 'sending';
      status.textContent = form.dataset.msgSending ?? '';
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        status.dataset.state = 'success';
        status.textContent = form.dataset.msgSuccess ?? '';
        trackEvent('generate_lead');
      } catch {
        status.dataset.state = 'error';
        status.textContent = form.dataset.msgError ?? '';
      } finally {
        submit.disabled = false;
      }
    });
  });

  root.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLElement>('[data-plan]');
    const select = root.querySelector<HTMLSelectElement>('select[name="interest"]');
    if (link?.dataset.plan && select) select.value = link.dataset.plan;
  });
}
