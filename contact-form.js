/**
 * Contact Form Handler
 * Secure client-side validation and submission
 * Works alongside main.js
 * Handles floating labels
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactForm);
    } else {
        initContactForm();
    }
    
    function initContactForm() {
        const form = document.getElementById('contact-form-element');
        if (!form) return;
        
        // Form elements
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const serviceSelect = document.getElementById('service');
        const messageTextarea = document.getElementById('message');
        const privacyCheckbox = document.getElementById('privacy');
        const submitButton = form.querySelector('.btn-submit');
        const formStatus = document.getElementById('form-status');
        
        // Honeypot field for bot detection
        const honeypot = form.querySelector('[name="_gotcha"]');
        
        // Handle floating labels - add has-content class when field has value
        function updateFloatingLabel(input) {
            const formGroup = input.closest('.form-group');
            if (!formGroup) return;
            
            if (input.value.trim() !== '') {
                formGroup.classList.add('has-content');
            } else {
                formGroup.classList.remove('has-content');
            }
        }
        
        // Initialize floating labels for fields that have content on load
        [nameInput, emailInput, phoneInput, messageTextarea].forEach(field => {
            if (field && field.value.trim() !== '') {
                const formGroup = field.closest('.form-group');
                if (formGroup) formGroup.classList.add('has-content');
            }
        });
        
        // Validation rules
        const validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-Z\s\-'\.]+$/,
                message: 'Please enter a valid name (letters, spaces, hyphens, apostrophes only)'
            },
            email: {
                required: true,
                pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
                message: 'Please enter a valid email address'
            },
            phone: {
                required: false,
                pattern: /^[\d\s\-\+\(\)]{10,20}$/,
                message: 'Please enter a valid phone number (10-20 digits)'
            },
            service: {
                required: true,
                message: 'Please select a service'
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 2000,
                message: 'Please enter a message (10-2000 characters)'
            },
            privacy: {
                required: true,
                message: 'You must agree to the privacy policy'
            }
        };
        
        // Real-time validation
        function validateField(field) {
            const fieldName = field.name;
            const fieldValue = field.value.trim();
            const rules = validationRules[fieldName];
            const errorSpan = document.getElementById(`${fieldName}-error`);
            
            if (!rules || !errorSpan) return true;
            
            // Clear previous error
            errorSpan.textContent = '';
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            
            // Check required
            if (rules.required && !fieldValue) {
                if (field.type === 'checkbox') {
                    if (!field.checked) {
                        showError(field, errorSpan, rules.message);
                        return false;
                    }
                } else {
                    showError(field, errorSpan, rules.message);
                    return false;
                }
            }
            
            // Skip further validation if field is optional and empty
            if (!rules.required && !fieldValue) {
                return true;
            }
            
            // Check minimum length
            if (rules.minLength && fieldValue.length < rules.minLength) {
                showError(field, errorSpan, `Minimum ${rules.minLength} characters required`);
                return false;
            }
            
            // Check maximum length
            if (rules.maxLength && fieldValue.length > rules.maxLength) {
                showError(field, errorSpan, `Maximum ${rules.maxLength} characters allowed`);
                return false;
            }
            
            // Check pattern
            if (rules.pattern && !rules.pattern.test(fieldValue)) {
                showError(field, errorSpan, rules.message);
                return false;
            }
            
            // Field is valid
            field.classList.add('valid');
            return true;
        }
        
        function showError(field, errorSpan, message) {
            errorSpan.textContent = message;
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
        }
        
        // Validate entire form
        function validateForm() {
            let isValid = true;
            
            // Check honeypot (if filled, it's a bot)
            if (honeypot && honeypot.value) {
                console.warn('Honeypot triggered - possible bot submission');
                return false;
            }
            
            // Validate all fields
            [nameInput, emailInput, phoneInput, serviceSelect, messageTextarea, privacyCheckbox].forEach(field => {
                if (field && !validateField(field)) {
                    isValid = false;
                }
            });
            
            return isValid;
        }
        
        // Show form status message
        function showStatus(message, type = 'info') {
            formStatus.textContent = message;
            formStatus.className = `form-status form-status-${type}`;
            formStatus.style.display = 'block';
            
            // Auto-hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }
        }
        
        // Handle form submission
        async function handleSubmit(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                showStatus('Please fix the errors above before submitting.', 'error');
                // Focus first error field
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }
            
            // Disable submit button to prevent double submission
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Get form data
            const formData = new FormData(form);
            
            // Remove honeypot from submission
            formData.delete('_gotcha');
            
            try {
                // TODO: Replace with your actual endpoint
                // Options:
                // 1. Formspree: https://formspree.io/
                // 2. Netlify Forms: Built-in with Netlify hosting
                // 3. Custom backend API
                
                // Example with fetch (replace URL with your endpoint):
                /*
                const response = await fetch('YOUR_FORM_ENDPOINT_HERE', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showStatus('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
                    form.reset();
                    // Remove validation classes
                    form.querySelectorAll('.valid, .error, .has-content').forEach(el => {
                        el.classList.remove('valid', 'error', 'has-content');
                    });
                } else {
                    throw new Error('Form submission failed');
                }
                */
                
                // For demonstration (remove this in production):
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Log form data (for testing - remove in production)
                console.log('Form Data:', Object.fromEntries(formData));
                
                showStatus(
                    'Thank you! Your message has been sent successfully. I\'ll get back to you within 24 hours!', 
                    'success'
                );
                
                // Reset form
                form.reset();
                
                // Remove validation classes and floating label states
                form.querySelectorAll('.valid, .error, .has-content').forEach(el => {
                    el.classList.remove('valid', 'error', 'has-content');
                });
                
                // Scroll to success message
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
            } catch (error) {
                console.error('Form submission error:', error);
                showStatus(
                    'Oops! Something went wrong. Please try again or email me directly at hello@hcweblabs.com', 
                    'error'
                );
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            }
        }
        
        // Event listeners for floating labels
        [nameInput, emailInput, phoneInput, messageTextarea].forEach(field => {
            if (!field) return;
            
            // Update on input
            field.addEventListener('input', () => {
                updateFloatingLabel(field);
            });
            
            // Update on blur
            field.addEventListener('blur', () => {
                updateFloatingLabel(field);
                validateField(field);
            });
        });
        
        // Validation on change for select and checkbox
        serviceSelect?.addEventListener('change', () => validateField(serviceSelect));
        privacyCheckbox?.addEventListener('change', () => validateField(privacyCheckbox));
        
        // Optional: Validate on input with debounce for better UX
        let validationTimeout;
        [nameInput, emailInput, phoneInput, messageTextarea].forEach(field => {
            field?.addEventListener('input', () => {
                clearTimeout(validationTimeout);
                validationTimeout = setTimeout(() => {
                    if (field.value.trim()) {
                        validateField(field);
                    }
                }, 500);
            });
        });
        
        // Form submission
        form.addEventListener('submit', handleSubmit);
        
        // Prevent form submission on Enter in text inputs (except textarea)
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
        
        console.log('✉️ Contact form initialized with validation and floating labels');
    }
})();
