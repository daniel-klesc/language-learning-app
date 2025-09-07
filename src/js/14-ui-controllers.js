// src/js/14-ui-controllers.js
// UI event handlers and DOM controllers

// ============= UI HELPER FUNCTIONS =============
function showNotification(message, type = 'info') {
    // Simple notification system (can be enhanced with toast library)
    const notification = createElement('div', `notification ${type}`);
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showModal(title, content, buttons = []) {
    // Generic modal creator
    const modal = createElement('div', 'modal-overlay');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="modal-close" onclick="closeModal(this)">×</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${buttons.map(btn => 
                    `<button class="${btn.class}" onclick="${btn.onclick}">${btn.text}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

function closeModal(element) {
    const modal = element.closest('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// ============= LOADING STATES =============
function showLoading(elementId, message = 'Loading...') {
    const element = $(elementId);
    if (element) {
        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        element.disabled = true;
    }
}

function hideLoading(elementId) {
    const element = $(elementId);
    if (element && element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
        delete element.dataset.originalContent;
        element.disabled = false;
    }
}

// ============= FORM VALIDATION =============
function validateInput(input, rules) {
    const value = input.value.trim();
    const errors = [];
    
    if (rules.required && !value) {
        errors.push('This field is required');
    }
    
    if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Minimum length is ${rules.minLength} characters`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Maximum length is ${rules.maxLength} characters`);
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.patternMessage || 'Invalid format');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

function showInputError(input, message) {
    input.classList.add('error');
    
    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = createElement('div', 'error-message');
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px;';
    input.parentElement.appendChild(errorDiv);
}

function clearInputError(input) {
    input.classList.remove('error');
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// ============= RESPONSIVE MENU =============
function setupMobileMenu() {
    // Create mobile menu toggle if needed
    const menuToggle = createElement('button', 'mobile-menu-toggle');
    menuToggle.innerHTML = '☰';
    menuToggle.style.cssText = `
        display: none;
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1001;
        background: white;
        border: none;
        font-size: 24px;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    
    // Show on mobile
    if (window.innerWidth < 768) {
        menuToggle.style.display = 'block';
    }
    
    menuToggle.onclick = toggleMobileMenu;
    document.body.appendChild(menuToggle);
}

function toggleMobileMenu() {
    const menu = $('.mobile-menu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

// ============= KEYBOARD SHORTCUTS =============
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Skip if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + S: Start session
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (State.get().currentView === 'home') {
                StudySession.start(3); // Start with recommended size
            }
        }
        
        // Ctrl/Cmd + P: Pause session
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            if (State.get().currentView === 'study') {
                StudySession.pause();
            }
        }
        
        // Ctrl/Cmd + V: Open vocabulary manager
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            e.preventDefault();
            VocabularyManager.open();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Space: Check answer (in study mode)
        if (e.key === ' ' && State.get().currentView === 'study') {
            e.preventDefault();
            StudySession.handleButtonClick();
        }
        
        // Number keys 1-4: Select multiple choice option
        if (State.get().currentView === 'study' && 
            State.get().currentCardSkillLevel === SKILL_LEVELS.BEGINNER) {
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                StudySession.selectChoice(index);
            }
        }
    });
}

// ============= TOUCH GESTURES =============
function setupTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;
        
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                // Swipe right
                if (State.get().currentView === 'study') {
                    // Could implement: show hint or previous card
                }
            } else {
                // Swipe left
                if (State.get().currentView === 'study' && State.get().isAnswerShown) {
                    StudySession.nextCard();
                }
            }
        }
        
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
            if (deltaY > 0) {
                // Swipe down - could show answer
            } else {
                // Swipe up - could hide answer
            }
        }
    }
}

// ============= ACCESSIBILITY =============
function setupAccessibility() {
    // Add ARIA labels
    $('button:not([aria-label])').forEach(btn => {
        if (btn.textContent && !btn.querySelector('*')) {
            btn.setAttribute('aria-label', btn.textContent);
        }
    });
    
    // Add keyboard navigation hints
    $('input, button, select').forEach(el => {
        if (!el.getAttribute('tabindex')) {
            el.setAttribute('tabindex', '0');
        }
    });
    
    // Skip navigation link
    const skipLink = createElement('a', 'skip-link');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: #667eea;
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
    `;
    skipLink.onfocus = () => {
        skipLink.style.top = '0';
    };
    skipLink.onblur = () => {
        skipLink.style.top = '-40px';
    };
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ============= THEME MANAGEMENT =============
function setupTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Check for system preference
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addListener((e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    
    // Update theme-specific styles
    if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg-color', '#1a1a1a');
        document.documentElement.style.setProperty('--text-color', '#ffffff');
    } else {
        document.documentElement.style.setProperty('--bg-color', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#333333');
    }
}

function toggleTheme() {
    const currentTheme = document.body.dataset.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

// ============= MODAL MANAGEMENT =============
function closeAllModals() {
    // Close vocabulary manager
    VocabularyManager.close();
    
    // Close upload preview
    cancelUploadPreview();
    
    // Close settings
    const settingsMenu = $('#settings-menu');
    const settingsOverlay = $('#settings-overlay');
    if (settingsMenu && settingsMenu.classList.contains('open')) {
        settingsMenu.classList.remove('open');
        settingsOverlay.classList.remove('open');
    }
    
    // Close skill switch menu
    hideSkillSwitchMenu();
    
    // Close any custom modals
    $('.modal-overlay').forEach(modal => modal.remove());
}

// ============= CONFIRMATION DIALOGS =============
function confirmAction(message, onConfirm, onCancel) {
    const modal = showModal('Confirm Action', `
        <p>${message}</p>
    `, [
        {
            text: 'Cancel',
            class: 'btn-secondary',
            onclick: `closeModal(this); ${onCancel ? `(${onCancel})()` : ''}`
        },
        {
            text: 'Confirm',
            class: 'btn-primary',
            onclick: `closeModal(this); (${onConfirm})()`
        }
    ]);
    
    return modal;
}

// ============= PROGRESS ANIMATIONS =============
function animateProgressBar(element, fromValue, toValue, duration = 500) {
    const startTime = Date.now();
    const deltaValue = toValue - fromValue;
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out-cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = fromValue + (deltaValue * eased);
        
        element.style.width = `${currentValue}%`;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function animateNumber(element, fromValue, toValue, duration = 500) {
    const startTime = Date.now();
    const deltaValue = toValue - fromValue;
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(fromValue + (deltaValue * eased));
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ============= DYNAMIC CONTENT LOADING =============
function lazyLoadContent(selector, loadFunction) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadFunction(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    $(selector).forEach(el => observer.observe(el));
}

// ============= ERROR HANDLING UI =============
function showError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    const errorMessage = `
        <div class="error-alert">
            <h4>An error occurred</h4>
            <p>${error.message || 'Unknown error'}</p>
            ${context ? `<small>Context: ${context}</small>` : ''}
        </div>
    `;
    
    showNotification(errorMessage, 'error');
    devLog(`Error in ${context}: ${error.message}`, 'error');
}

// ============= INITIALIZATION =============
function initializeUIControllers() {
    setupKeyboardShortcuts();
    setupTouchGestures();
    setupAccessibility();
    setupTheme();
    setupMobileMenu();
    
    // Add global error handler
    window.addEventListener('error', (e) => {
        showError(e.error, 'Global');
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
        showError(new Error(e.reason), 'Promise');
    });
    
    devLog('UI controllers initialized', 'success');
}

// Export UI controller functions
window.UIControllers = {
    showNotification,
    showModal,
    closeModal,
    showLoading,
    hideLoading,
    validateInput,
    showInputError,
    clearInputError,
    setupMobileMenu,
    toggleMobileMenu,
    setupKeyboardShortcuts,
    setupTouchGestures,
    setupAccessibility,
    setupTheme,
    toggleTheme,
    closeAllModals,
    confirmAction,
    animateProgressBar,
    animateNumber,
    lazyLoadContent,
    showError,
    initialize: initializeUIControllers
};

// Make some functions globally available
window.showNotification = showNotification;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.toggleTheme = toggleTheme;