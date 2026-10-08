(() => {
  window.lucide?.createIcons();
  document.getElementById('year').textContent = new Date().getFullYear();

  // Keep Tab cycling within each dialog, including the boundary between the
  // last link and the browser chrome. Native dialogs handle Escape and inertness.
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('a[href], button:not(:disabled), [tabindex="0"]')]
        .filter(node => node.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });
  });

  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const mobileMenu = document.getElementById('mobileMenu');

  menuToggle.addEventListener('click', () => {
    mobileMenu.showModal();
    menuToggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('dialog-open');
    menuClose.focus();
  });
  menuClose.addEventListener('click', () => mobileMenu.close());
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.close());
  });
  mobileMenu.addEventListener('close', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('dialog-open');
  });
  const desktop = window.matchMedia('(min-width: 768px)');
  desktop.addEventListener('change', () => {
    if (desktop.matches && mobileMenu.open) mobileMenu.close();
  });

    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const button = contactForm.querySelector('button[type="submit"]');
        const buttonText = button?.querySelector('span');
        const originalText = buttonText?.textContent || 'Start a Conversation';

        if (button) button.disabled = true;
        if (buttonText) buttonText.textContent = 'Sending...';

        if (formStatus) {
        formStatus.textContent = '';
        formStatus.classList.remove('visible', 'error');
        }

        try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: {
            Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Form submission failed');
        }

        contactForm.reset();

        if (buttonText) buttonText.textContent = 'Message Sent';

        if (formStatus) {
            formStatus.textContent = 'Thanks — I got your message. I’ll follow up soon.';
            formStatus.classList.add('visible');
        }

        window.setTimeout(() => {
            if (buttonText) buttonText.textContent = originalText;
            if (button) button.disabled = false;
        }, 3500);
        } catch (error) {
        if (buttonText) buttonText.textContent = 'Try Again';

        if (formStatus) {
            formStatus.textContent = 'Something went wrong. You can email me directly instead.';
            formStatus.classList.add('visible', 'error');
        }

        if (button) button.disabled = false;
        console.error(error);
        }
    });
    }
})();
