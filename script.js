// Mobile Navigation Toggle
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll(".nav-menu a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if (window.scrollY > 100) {
    header.style.background = "rgba(255, 255, 255, 0.98)";
    header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  } else {
    header.style.background = "rgba(255, 255, 255, 0.95)";
    header.style.boxShadow = "none";
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(
    ".fade-in, .slide-up, .stat-card, .skill-category, .project-card"
  );
  animatedElements.forEach((el) => {
    observer.observe(el);
  });
});

// Skill bars animation
const skillBars = document.querySelectorAll(".skill-bar");
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const skillBar = entry.target;
        const level = skillBar.getAttribute("data-level");
        skillBar.style.width = level + "%";
      }
    });
  },
  { threshold: 0.5 }
);

skillBars.forEach((bar) => {
  skillObserver.observe(bar);
});

// Contact form handling
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const name = formData.get("name");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    // Simple validation
    if (!name || !email || !subject || !message) {
      alert("Please fill in all fields");
      return;
    }

    // Simulate form submission
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML =
      '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    setTimeout(() => {
      alert("Thank you for your message! I'll get back to you soon.");
      this.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 2000);
  });
}

// Add loading animation to page
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// Parallax effect for hero section
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector(".floating-shapes");
  if (parallax) {
    const speed = scrolled * 0.5;
    parallax.style.transform = `translateY(${speed}px)`;
  }
});

// Dynamic typing effect for hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Initialize typing effect when page loads
document.addEventListener("DOMContentLoaded", () => {
  const nameElement = document.querySelector(".name");
  if (nameElement) {
    const originalText = nameElement.textContent;
    setTimeout(() => {
      typeWriter(nameElement, originalText, 150);
    }, 1000);
  }
});
