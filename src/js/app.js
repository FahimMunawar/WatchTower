let priceHistory = [];
let lastPrice = null;

// Currency symbols mapping
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$'
};

async function refreshPrice() {
    const refreshBtn = document.getElementById('refreshBtn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const priceDisplay = document.getElementById('priceDisplay');
    const lastUpdated = document.getElementById('lastUpdated');
    const currency = document.getElementById('currency').value;

    // Show loading state
    refreshBtn.disabled = true;
    loading.style.display = 'block';
    error.style.display = 'none';
    priceDisplay.classList.add('updating');

    try {
        // Simulate API delay (more realistic)
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        // Generate mock gold price data
        const mockPrice = generateMockGoldPrice();
        const price = convertPrice(mockPrice, currency);
        
        // Update display with animation
        const symbol = currencySymbols[currency];
        priceDisplay.textContent = `${symbol}${price.toFixed(2)}`;
        
        // Add to history
        addToHistory(price, currency);
        
        // Update timestamp
        lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
        
        // Store last price for comparison
        lastPrice = price;
        
        console.log(`Gold price updated: ${symbol}${price.toFixed(2)} ${currency}`);
        
    } catch (err) {
        showError('Failed to fetch gold price. Please try again.');
        console.error('Error fetching gold price:', err);
    } finally {
        // Hide loading state
        refreshBtn.disabled = false;
        loading.style.display = 'none';
        priceDisplay.classList.remove('updating');
    }
}

function generateMockGoldPrice() {
    // Generate a realistic gold price around $2000 per ounce with some variation
    const basePrice = 2000;
    const variation = (Math.random() - 0.5) * 100; // ±$50 variation
    const timeVariation = Math.sin(Date.now() / 10000) * 20; // Time-based variation
    return Math.max(1800, basePrice + variation + timeVariation); // Ensure minimum price
}

function convertPrice(usdPrice, currency) {
    // Mock exchange rates (in practice, you'd fetch real rates)
    const exchangeRates = {
        'USD': 1,
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110,
        'CAD': 1.25,
        'AUD': 1.35
    };
    
    return usdPrice * (exchangeRates[currency] || 1);
}

function addToHistory(price, currency) {
    const now = new Date();
    const historyItem = {
        price: price,
        currency: currency,
        timestamp: now,
        change: lastPrice ? price - lastPrice : 0
    };
    
    priceHistory.unshift(historyItem);
    
    // Keep only last 10 entries
    if (priceHistory.length > 10) {
        priceHistory = priceHistory.slice(0, 10);
    }
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('history');
    const historyList = document.getElementById('historyList');
    
    if (priceHistory.length === 0) {
        historyDiv.style.display = 'none';
        return;
    }
    
    historyDiv.style.display = 'block';
    historyList.innerHTML = '';
    
    priceHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const symbol = currencySymbols[item.currency];
        const timeStr = item.timestamp.toLocaleTimeString();
        
        let changeStr = '';
        if (index < priceHistory.length - 1 && item.change !== 0) {
            const changeClass = item.change > 0 ? 'price-up' : 'price-down';
            const changeIcon = item.change > 0 ? '▲' : '▼';
            changeStr = `<span class="price-change ${changeClass}">${changeIcon} ${Math.abs(item.change).toFixed(2)}</span>`;
        }
        
        historyItem.innerHTML = `
            <span>${timeStr}</span>
            <span>${symbol}${item.price.toFixed(2)} ${changeStr}</span>
        `;
        
        historyList.appendChild(historyItem);
    });
}

function showError(message) {
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    error.style.display = 'block';
}

// Auto-refresh every 30 seconds
let autoRefreshInterval;

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        if (priceHistory.length > 0) {
            refreshPrice();
        }
    }, 30000);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gold Price Tracker loaded in Docker container');
    
    // Add loading animation
    setTimeout(() => {
        document.querySelector('.container').classList.add('loaded');
    }, 100);
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Add visibility change handler to pause/resume auto-refresh
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
        }
    });
});

// Handle page unload
window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
});