document.addEventListener('DOMContentLoaded', function() {
    // Create floating particles
    function createParticles() {
        const particlesContainer = document.querySelector('.floating-particles');
        if (!particlesContainer) return;
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // Update character count
    function updateCharCount() {
        const textarea = document.getElementById('text');
        const charCount = document.getElementById('charCount');
        const count = textarea.value.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }

    // Autofill textarea with page text
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            func: () => {
                const el = document.querySelector('#viewerWEB');
                return el ? el.innerText : '';
            }
        }, function(results) {
            if (results && results[0] && results[0].result) {
                let text = results[0].result;
                // Filter out unwanted phrases
                const unwanted = [
                    'Listen',
                    'English',
                    'You have successfully validated this challenge',
                    'Next',
                    'Did you enjoy the content?',
                    'Like',
                    'Dislike'
                ];
                text = text.split('\n').filter(line =>
                    !unwanted.some(phrase => line.trim() === phrase)
                ).join('\n');
                document.getElementById('text').value = text;
                updateCharCount();
            }
        });
    });

    // Listen for text changes
    document.getElementById('text').addEventListener('input', updateCharCount);

    // Copy text functionality
    document.getElementById('copy').addEventListener('click', async function() {
        const textarea = document.getElementById('text');
        const copyButton = this;
        const copyText = document.getElementById('copyText');
        const successMessage = document.getElementById('successMessage');
        if (textarea.value.trim() === '') {
            return;
        }
        try {
            await navigator.clipboard.writeText(textarea.value);
            // Show success message
            successMessage.classList.add('show');
            // Update button text temporarily
            copyText.textContent = 'Copied!';
            copyButton.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
            setTimeout(() => {
                successMessage.classList.remove('show');
                copyText.textContent = 'Copy Text';
                copyButton.style.background = 'linear-gradient(135deg, #32b39e, #32b39e)';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            textarea.select();
            document.execCommand('copy');
            successMessage.classList.add('show');
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 2000);
        }
    });

    // Clear text functionality
    document.getElementById('clear').addEventListener('click', function() {
        const textarea = document.getElementById('text');
        textarea.value = '';
        updateCharCount();
    });

    // Add some interactive hover effects
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', function() {
            if (this.id !== 'copy' || !this.classList.contains('copying')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });

    // Initial setup
    createParticles();
    updateCharCount();
});