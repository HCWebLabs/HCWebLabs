// ===== UTILITY FUNCTIONS =====
/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait = 250) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Check if element exists before using it
 * @param {string} selector - CSS selector
 * @returns {Element|null} Element or null
 */
const getElement = (selector) => {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
};

/**
 * Get all elements matching selector
 * @param {string} selector - CSS selector
 * @returns {NodeList} NodeList of elements
 */
const getElements = (selector) => {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Elements not found: ${selector}`);
        return [];
    }
};

// ===== MOBILE MENU TOGGLE =====
const mobileMenuBtn = getElement('#mobile-menu-btn');
const mobileNav = getElement('#main-nav');
const menuOverlay = getElement('#menu-overlay');
const navLinks = getElements('.nav-link');

function toggleMobileMenu() {
    if (!mobileMenuBtn || !mobileNav || !menuOverlay) return;
    
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    mobileMenuBtn.classList.toggle('active');
    mobileNav.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (!isExpanded) {
        document.body.style.overflow = 'hidden';
        // Focus first nav link when menu opens
        setTimeout(() => {
            const firstLink = navLinks[0];
            if (firstLink) firstLink.focus();
        }, 100);
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    if (!mobileMenuBtn || !mobileNav || !menuOverlay) return;
    
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.classList.remove('active');
    mobileNav.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Toggle menu on button click
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

// Close menu when overlay is clicked
if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMobileMenu);
}

// Close menu when nav link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('active')) {
        closeMobileMenu();
        mobileMenuBtn?.focus();
    }
});

// Focus trap for mobile menu
if (mobileNav && navLinks.length > 0) {
    const firstNavLink = navLinks[0];
    const lastNavLink = navLinks[navLinks.length - 1];
    
    document.addEventListener('keydown', (e) => {
        if (!mobileNav.classList.contains('active')) return;
        
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === mobileMenuBtn) {
                    e.preventDefault();
                    lastNavLink.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastNavLink) {
                    e.preventDefault();
                    mobileMenuBtn.focus();
                }
            }
        }
    });
}

// Close menu on window resize if it gets too wide - debounced
const handleResize = debounce(() => {
    if (window.innerWidth >= 768 && mobileNav?.classList.contains('active')) {
        closeMobileMenu();
    }
}, 250);

window.addEventListener('resize', handleResize, { passive: true });

// ===== SMOOTH SCROLL WITH OFFSET =====
const smoothScrollToTarget = (target) => {
    if (!target) return;
    
    // Calculate header offset based on viewport width
    const headerOffset = window.innerWidth < 768 ? 70 : 80;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
};

getElements('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        
        e.preventDefault();
        const target = getElement(href);
        smoothScrollToTarget(target);
    });
});

// ===== VIEW TRANSITIONS API =====
if ('startViewTransition' in document && 
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Add view transitions to navigation
    getElements('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = getElement(href);
            if (!target) return;
            
            e.preventDefault();
            
            document.startViewTransition(() => {
                smoothScrollToTarget(target);
            });
        });
    });
}

// ===== HEADER SCROLL EFFECT & SCROLL TO TOP BUTTON =====
let lastScroll = 0;
const header = getElement('.header');
const scrollToTopBtn = getElement('#scroll-to-top');

const handleScroll = throttle(() => {
    const currentScroll = window.pageYOffset;
    
    // Header shadow effect
    if (header) {
        if (currentScroll <= 0) {
            header.style.boxShadow = 'none';
        } else {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        }
    }
    
    // Show/hide scroll to top button
    if (scrollToTopBtn) {
        if (currentScroll > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
    
    lastScroll = currentScroll;
}, 100);

window.addEventListener('scroll', handleScroll, { passive: true });

// Scroll to top button click handler
if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
// Fallback for browsers that don't support scroll-driven animations
if (!CSS.supports('animation-timeline', 'view()')) {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    };
    
    try {
        const observer = new IntersectionObserver(animateOnScroll, observerOptions);
        
        getElements('.glass-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px) scale(0.95)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    } catch (error) {
        console.warn('IntersectionObserver not supported');
    }
}

// ===== PERFORMANCE MONITORING =====
if ('PerformanceObserver' in window) {
    // Monitor Largest Contentful Paint (LCP)
    try {
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            const lcpTime = lastEntry.renderTime || lastEntry.loadTime;
            
            if (lcpTime) {
                console.log(`✅ LCP: ${Math.round(lcpTime)}ms`, 
                    lcpTime < 2500 ? '(Good)' : '(Needs improvement)');
            }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
        // Browser doesn't support this metric
    }
    
    // Monitor Cumulative Layout Shift (CLS)
    try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                }
            }
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // Log CLS on page unload
        window.addEventListener('beforeunload', () => {
            console.log(`✅ CLS: ${clsScore.toFixed(3)}`, 
                clsScore < 0.1 ? '(Good)' : '(Needs improvement)');
        }, { once: true });
    } catch (e) {
        // Browser doesn't support this metric
    }
    
    // Monitor First Input Delay (FID) / Interaction to Next Paint (INP)
    try {
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const delay = entry.processingStart - entry.startTime;
                console.log(`✅ Input Delay: ${Math.round(delay)}ms`, 
                    delay < 100 ? '(Good)' : '(Needs improvement)');
            }
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
        // Browser doesn't support this metric
    }
}

// ===== INITIALIZATION COMPLETE =====
console.log('%c✨ HC Web Labs - Portfolio Website', 
    'color: #ff2e97; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with modern web standards & Font Awesome icons', 
    'color: #00f5ff; font-size: 12px;');
console.log('%c💻 Heather Cooper - Knoxville, TN', 
    'color: #b829f5; font-size: 12px;');

// Log feature support
const features = {
    'View Transitions': 'startViewTransition' in document,
    'Container Queries': CSS.supports('container-type: inline-size'),
    'Scroll-driven Animations': CSS.supports('animation-timeline: view()'),
    'OKLCH Colors': CSS.supports('color: oklch(0% 0 0)'),
    'Backdrop Filter': CSS.supports('backdrop-filter: blur(10px)'),
    ':has() Selector': CSS.supports('selector(:has(*))'),
};

console.log('🚀 Browser Feature Support:');
Object.entries(features).forEach(([feature, supported]) => {
    console.log(`  ${supported ? '✅' : '❌'} ${feature}`);
});
