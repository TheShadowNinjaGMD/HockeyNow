document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = {
    root: null, // relative to the viewport
    rootMargin: "0px",
    threshold: 0.15 
  };

  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
    	entry.target.classList.add("visible");
	observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elementsToAnimate = document.querySelectorAll(".fade-up");
  elementsToAnimate.forEach((el) => fadeObserver.observe(el));

  const navbar = document.querySelector("nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.borderBottomColor = "rgba(255, 255, 255, 0.15)";
      navbar.style.background = "rgba(0, 0, 0, 0.85)";
    } else {
      navbar.style.borderBottomColor = "rgba(255, 255, 255, 0.1)";
      navbar.style.background = "rgba(0, 0, 0, 0.75)";
    }
  });
});