/**
 * scrollObserver.js
 * Global scroll animation initialiser.
 *
 * Observes every element that carries a `data-animate` attribute and
 * toggles the `is-visible` class when it enters the viewport.
 *
 * Works as a progressive enhancement: pages that use <AnimatedSection>
 * already get the class from React; this catches any plain HTML/CSS
 * elements that use the data-animate attribute directly.
 *
 * Call initScrollObserver() once after the app mounts.
 */

export function initScrollObserver() {
  if (typeof IntersectionObserver === "undefined") return;

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    // Immediately mark everything as visible
    document.querySelectorAll("[data-animate]").forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Apply any explicit delay from data-delay attribute (ms)
          const delay = parseInt(
            entry.target.getAttribute("data-delay") || "0",
            10,
          );
          if (delay > 0) {
            setTimeout(() => {
              entry.target.classList.add("is-visible");
            }, delay);
          } else {
            entry.target.classList.add("is-visible");
          }
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "-30px 0px -30px 0px",
    },
  );

  // Observe all current [data-animate] elements
  const observe = () => {
    document
      .querySelectorAll("[data-animate]:not(.is-visible)")
      .forEach((el) => {
        observer.observe(el);
      });
  };

  // Initial pass
  observe();

  // Re-scan when new content is injected (route changes, lazy loads)
  const mutationObserver = new MutationObserver(() => observe());
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}
