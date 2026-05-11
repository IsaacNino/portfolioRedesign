(() => {
  const loader = document.getElementById('loader');
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const mobileMenu = document.getElementById('mobileMenu');

  if (window.lucide) {
    window.lucide.createIcons();
  }

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      loader?.classList.add('hidden');
    }, 900);
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (supportsFinePointer && cursorDot && cursorRing) {
    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.left = `${mouseX - 4}px`;
      cursorDot.style.top = `${mouseY - 4}px`;
    });

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = `${ringX - 20}px`;
      cursorRing.style.top = `${ringY - 20}px`;
      window.requestAnimationFrame(animateCursor);
    };

    animateCursor();

    document.querySelectorAll('a, button, .project-card, .system-card, .lab-card').forEach((element) => {
      element.addEventListener('mouseenter', () => {
        cursorDot.style.transform = 'scale(2)';
        cursorRing.style.transform = 'scale(1.5)';
        cursorRing.style.borderColor = 'rgba(124,157,189,0.6)';
      });

      element.addEventListener('mouseleave', () => {
        cursorDot.style.transform = 'scale(1)';
        cursorRing.style.transform = 'scale(1)';
        cursorRing.style.borderColor = 'rgba(124,157,189,0.4)';
      });
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;

    if (navbar) {
      if (scrolled > 80) {
        navbar.style.background = 'rgba(15, 14, 13, 0.85)';
        navbar.style.backdropFilter = 'blur(20px)';
        navbar.style.borderBottom = '1px solid rgba(41, 37, 36, 0.5)';
      } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
        navbar.style.borderBottom = '1px solid transparent';
      }
    }

    document.querySelectorAll('.ambient-glow').forEach((glow, index) => {
      const speed = index === 0 ? 0.05 : 0.03;
      glow.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }, { passive: true });

  const openMobileMenu = () => {
    mobileMenu?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', openMobileMenu);
  menuClose?.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('.mobile-link').forEach((link) => link.addEventListener('click', closeMobileMenu));

  const updateTime = () => {
    const timeElement = document.getElementById('localTime');
    if (!timeElement) return;

    timeElement.textContent = new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/Denver',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  updateTime();
  window.setInterval(updateTime, 1000);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

    const projectData = {
    intrust: {
        title: 'InTrust',
        kicker: 'Local-First Tooling · Automation',
        visualClass: 'visual-intrust',
        summary: 'Estate planning software for law firms, designed to turn structured intake data into high-fidelity legal document packages.',
        role: 'Product Developer / Workflow Designer',
        focus: 'Legal document automation and workflow design',
        tools: 'Tauri · React · Rust · DOCX generation',
        status: 'Built / Iterating',
        problem: 'Estate packages are often assembled through repetitive manual drafting, formatting, and document coordination. The challenge was to preserve legal formatting precision while making the workflow faster and easier to repeat.',
        approach: 'I built a local-first desktop workflow that guides intake, applies rule-based logic, and generates formatted Word documents while respecting strict legal document conventions.',
        outcome: 'The result is a practical automation tool that reduces repetitive drafting effort and creates a foundation for bespoke firm-specific estate planning workflows.',
        links: [
          { label: 'View Live Site', url: 'https://www.getintrust.com/' },
        ]
    },

    postcard: {
        title: 'CES AI Postcard Generator',
        kicker: 'Generative Interface · Experiential Web',
        visualClass: 'visual-postcard',
        summary: 'A mobile-first interactive postcard concept using prompt-driven personalization to turn event identity into a shareable generated artifact.',
        role: 'Creative Technologist / Web Developer',
        focus: 'Generative interaction design and event engagement',
        tools: 'Tailwind · JavaScript · FLUX Generative AI · Prompt Matrix',
        status: 'Built / Concept Prototype',
        problem: 'Most event touchpoints are forgettable. The challenge was to create a lightweight, memorable interaction that could turn a quick scan into a personalized creative artifact.',
        approach: 'I designed a short prompt flow that captures a visitor’s CES mindset and translates it into a generated postcard composition with a consistent visual frame.',
        outcome: 'The concept creates a flexible bridge between physical networking, mobile interaction, and generative media.',
        links: [
          { label: 'View Live Site', url: 'https://cespostcard26.vercel.app/' },
        ]
    },

    gallery: {
        title: 'Dell Foundation Digital Gallery',
        kicker: 'Immersive Display · Storytelling System',
        visualClass: 'visual-gallery',
        summary: 'A large-format digital gallery experience blending media, interaction, and storytelling for a foundation-facing display environment.',
        role: 'Creative Technologist / Web Developer',
        focus: 'Large-format web experience and content system',
        tools: 'Tailwind · JavaScript',
        status: 'Built / Delivered Prototype',
        problem: 'The experience needed to organize rich media and story content for a large display environment without feeling like a conventional website.',
        approach: 'I built a fullscreen interactive gallery structure with cinematic tile behavior, modal content, video embeds, and layout logic suited for large-screen viewing.',
        outcome: 'The result was an immersive digital gallery prototype that made foundation stories easier to browse, present, and experience.',
        links: [
          { label: 'View Live Site', url: 'https://digital-museum-gallery.vercel.app/' },
        ]
    },

    dogwood: {
        title: 'Dogwood Counseling Website',
        kicker: 'Human-Centered Web · Client Site',
        visualClass: 'visual-dogwood',
        summary: 'A calm, trust-centered web presence for a Boulder therapist, designed around clarity, warmth, accessibility, and local discoverability.',
        role: 'Web Developer / Front-End Builder',
        focus: 'Client site design, trust-building, and light SEO',
        tools: 'Tailwind · JavaScript · SEO',
        status: 'Built / Delivered',
        problem: 'The provider needed a web presence that felt calmer, more trustworthy, and more aligned with the emotional tone of therapy work.',
        approach: 'I focused on simple information architecture, warm visual language, clear service framing, and accessible contact pathways.',
        outcome: 'The site became a more polished and approachable digital front door for prospective clients.',
        links: [
          { label: 'View Live Site', url: 'https://www.dogwoodcounseling-mb.com/' },
        ]
    }
    };

    const projectModal = document.getElementById('projectModal');
    const modalVisual = document.getElementById('modalVisual');

    const modalFields = {
    kicker: document.getElementById('modalKicker'),
    title: document.getElementById('modalTitle'),
    summary: document.getElementById('modalSummary'),
    role: document.getElementById('modalRole'),
    focus: document.getElementById('modalFocus'),
    tools: document.getElementById('modalTools'),
    status: document.getElementById('modalStatus'),
    problem: document.getElementById('modalProblem'),
    approach: document.getElementById('modalApproach'),
    outcome: document.getElementById('modalOutcome'),
    actions: document.getElementById('modalActions')
    };

    const openProjectModal = (projectKey) => {
    const project = projectData[projectKey];
    if (!project || !projectModal || !modalVisual) return;

    modalVisual.className = `project-modal-visual ${project.visualClass}`;

    modalFields.kicker.textContent = project.kicker;
    modalFields.title.textContent = project.title;
    modalFields.summary.textContent = project.summary;
    modalFields.role.textContent = project.role;
    modalFields.focus.textContent = project.focus;
    modalFields.tools.textContent = project.tools;
    modalFields.status.textContent = project.status;
    modalFields.problem.textContent = project.problem;
    modalFields.approach.textContent = project.approach;
    modalFields.outcome.textContent = project.outcome;

    modalFields.actions.innerHTML = '';

    if (project.links && project.links.length) {
    project.links.forEach((link) => {
        
        const anchor = document.createElement('a');
        
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noreferrer';
        anchor.className = 'project-modal-link';
        anchor.innerHTML = `<span>${link.label}</span><i data-lucide="arrow-up-right" class="w-4 h-4"></i>`;
        modalFields.actions.appendChild(anchor);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
    }

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    };

    const closeProjectModal = () => {
    if (!projectModal) return;

    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    };

    document.querySelectorAll('[data-project]').forEach((card) => {
    card.addEventListener('click', () => {
        openProjectModal(card.dataset.project);
    });

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProjectModal(card.dataset.project);
        }
    });
    });

    document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', closeProjectModal);
    });

    document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeProjectModal();
    }
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
