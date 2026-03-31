// API Configuration
const API_URL = 'https://proindustrialisation-fillingly-jerrica.ngrok-free.dev';

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const loadingIndicator = document.getElementById('loading');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const closeModal = document.getElementById('closeModal');
const historyList = document.getElementById('historyList');
const deleteAllHistoryBtn = document.getElementById('deleteAllHistory');
const historyStats = document.getElementById('historyStats');

// Chat History Storage
let chatHistory = [];

// Helper: Format time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Set current time for initial message
if (document.getElementById('currentTime')) {
    document.getElementById('currentTime').innerText = formatTime(new Date());
}

// Load history from localStorage
function loadHistory() {
    const saved = localStorage.getItem('gemini_chat_history');
    if (saved) {
        try {
            chatHistory = JSON.parse(saved);
            updateHistoryStats();
        } catch (e) {
            console.error('Error loading history:', e);
            chatHistory = [];
        }
    }
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('gemini_chat_history', JSON.stringify(chatHistory));
    updateHistoryStats();
}

// Update history statistics
function updateHistoryStats() {
    const count = chatHistory.length;
    if (historyStats) {
        historyStats.textContent = `${count} ${count === 1 ? 'conversation' : 'conversations'}`;
    }
}

// Add conversation to history
function addToHistory(userMessage, agentResponse) {
    const conversation = {
        id: Date.now(),
        userMessage: userMessage,
        agentResponse: agentResponse,
        timestamp: new Date().toISOString(),
        formattedTime: formatTime(new Date())
    };

    chatHistory.unshift(conversation); // Add to beginning for newest first
    saveHistory();
    renderHistory();
}

// Delete single conversation
function deleteConversation(id) {
    chatHistory = chatHistory.filter(conv => conv.id !== id);
    saveHistory();
    renderHistory();

    // Show toast notification
    showToast('Conversation deleted successfully');
}

// Delete all history
function deleteAllHistory() {
    if (chatHistory.length === 0) return;

    if (confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
        chatHistory = [];
        saveHistory();
        renderHistory();
        showToast('All history cleared');
    }
}

// Render history in modal
function renderHistory() {
    if (!historyList) return;

    if (chatHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M12 6v2M12 12v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <p>No chat history yet</p>
                <span>Start a conversation to see it here</span>
            </div>
        `;
        return;
    }

    historyList.innerHTML = chatHistory.map(conv => `
        <div class="history-item" data-id="${conv.id}">
            <div class="history-header">
                <div class="history-user">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>You</span>
                </div>
                <div class="history-date">${new Date(conv.timestamp).toLocaleString()}</div>
            </div>
            <div class="history-preview">
                <div class="history-question">📝 ${escapeHtml(conv.userMessage.substring(0, 100))}${conv.userMessage.length > 100 ? '...' : ''}</div>
                <div class="history-answer">✨ ${escapeHtml(conv.agentResponse.substring(0, 150))}${conv.agentResponse.length > 150 ? '...' : ''}</div>
            </div>
            <div class="history-actions">
                <button class="delete-history-btn" onclick="deleteConversation(${conv.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.closest('.history-item').dataset.id);
            deleteConversation(id);
        });
    });
}

// Show toast notification
function showToast(message, duration = 3000) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(10px);
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 0.85rem;
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        border-left: 3px solid #10b981;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: 'Inter', sans-serif;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Add toast animations to style
if (!document.querySelector('#toast-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'toast-styles';
    styleSheet.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Helper: Add message to chat
function addMessage(text, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatarIcon = sender === 'user' ? '👤' : '✨';
    const avatarClass = sender === 'user' ? 'user-avatar' : 'agent-avatar';

    const messageHTML = `
        <div class="message-content">
            <div class="avatar ${avatarClass}">${avatarIcon}</div>
            <div class="message-bubble">
                <p>${escapeHtml(text)}</p>
                <div class="message-meta">
                    <span class="time-stamp">${formatTime(new Date())}</span>
                    ${!isError ? '<span class="read-status">● Delivered</span>' : '<span class="read-status" style="color: #ef4444;">● Error</span>'}
                </div>
            </div>
        </div>
    `;

    messageDiv.innerHTML = messageHTML;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Helper: Show loading state
function showLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    if (sendBtn) sendBtn.disabled = true;
    if (userInput) userInput.disabled = true;
}

// Helper: Hide loading state
function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    if (sendBtn) sendBtn.disabled = false;
    if (userInput) {
        userInput.disabled = false;
        userInput.focus();
    }
}

// Main API call function
async function getGeminiResponse(userText) {
    showLoading();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        const response = await fetch(`${API_URL}/agent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ text: userText }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        let agentResponse = '';
        if (data && data.status === 'success' && data.agent_response) {
            agentResponse = data.agent_response;
            addMessage(agentResponse, 'agent');
            // Add to history
            addToHistory(userText, agentResponse);
        } else if (data && data.response) {
            agentResponse = data.response;
            addMessage(agentResponse, 'agent');
            addToHistory(userText, agentResponse);
        } else {
            throw new Error('Invalid response format from server');
        }

    } catch (error) {
        console.error('Gemini API Error:', error);

        let errorMessage = 'Sorry, I encountered an issue. ';
        if (error.name === 'AbortError') {
            errorMessage += 'The request timed out. Please try again.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to the server. Please check your internet connection or ensure the API endpoint is accessible.';
        } else {
            errorMessage += error.message || 'Please try again later.';
        }

        addMessage(errorMessage, 'agent', true);
    } finally {
        hideLoading();
    }
}

// Send message handler
async function handleSendMessage() {
    const text = userInput.value.trim();

    if (!text) {
        // Shake animation for empty input
        userInput.style.transform = 'shake 0.3s ease';
        setTimeout(() => {
            userInput.style.transform = '';
        }, 300);
        return;
    }

    // Add user message to chat
    addMessage(text, 'user');

    // Clear input
    userInput.value = '';

    // Auto-resize textarea (reset height)
    userInput.style.height = 'auto';

    // Get AI response
    await getGeminiResponse(text);
}

// Auto-resize textarea as user types
function autoResizeTextarea() {
    if (userInput) {
        userInput.style.height = 'auto';
        const newHeight = Math.min(userInput.scrollHeight, 120);
        userInput.style.height = newHeight + 'px';
    }
}

// Modal functions
function openModal() {
    if (historyModal) {
        renderHistory();
        historyModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModalFunction() {
    if (historyModal) {
        historyModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (historyModal && e.target === historyModal) {
        closeModalFunction();
    }
});

// Event Listeners
if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
}

if (userInput) {
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    userInput.addEventListener('input', autoResizeTextarea);
}

if (historyBtn) {
    historyBtn.addEventListener('click', openModal);
}

if (closeModal) {
    closeModal.addEventListener('click', closeModalFunction);
}

if (deleteAllHistoryBtn) {
    deleteAllHistoryBtn.addEventListener('click', deleteAllHistory);
}

// Focus input on load
if (userInput) {
    setTimeout(() => userInput.focus(), 100);
}

// Optional: Add smooth scroll on new messages
const observer = new MutationObserver(() => {
    if (chatMessages) {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }
});

if (chatMessages) {
    observer.observe(chatMessages, { childList: true, subtree: true });
}

// Add some keyboard shortcuts info
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (userInput) userInput.focus();
    }

    // Escape to clear input
    if (e.key === 'Escape' && document.activeElement === userInput) {
        userInput.value = '';
        userInput.style.height = 'auto';
    }

    // Escape to close modal
    if (e.key === 'Escape' && historyModal && historyModal.style.display === 'block') {
        closeModalFunction();
    }
});

// Initialize
loadHistory();

// Console welcome message
console.log('%c✨ Gemini AI Summarizer | Developed by Liton Hossain', 'color: #6366f1; font-size: 14px; font-weight: bold;');
console.log('%cAI-Powered Summarization Engine Active with Chat History', 'color: #10b981; font-size: 12px;');

// Optional: Add connection test on load (silent)
async function testConnection() {
    try {
        const response = await fetch(`${API_URL}/agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'ping' }),
            signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
            console.log('✅ API Connection: Active');
        }
    } catch (error) {
        console.warn('⚠️ API Connection: Unable to reach server. Please verify ngrok URL is active.');
    }
}

// Uncomment to test connection silently (optional)
// testConnection();
