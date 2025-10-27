// --- GLOBAL STATE ---
var itemsToReceive = [];
var itemsToAdd = [];
var currentMasterDataType = null;
var topPartsChart = null;
var monthlyWithdrawalChart = null;

// START: GLOBAL STATE FOR INVENTORY MODAL FILTERING
var currentModalPartsInGroup = [];
// END: GLOBAL STATE FOR INVENTORY MODAL FILTERING

// --- DATABASE (LocalStorage) ---
var db = {
    getParts: function() {
        try {
            return JSON.parse(localStorage.getItem('parts')) || [];
        } catch (e) {
            console.error('Error loading parts:', e);
            return [];
        }
    },
    saveParts: function(parts) { 
        localStorage.setItem('parts', JSON.stringify(parts)); 
    },
    getTransactions: function() {
        try {
            return JSON.parse(localStorage.getItem('transactions')) || [];
        } catch (e) {
            console.error('Error loading transactions:', e);
            return [];
        }
    },
    saveTransactions: function(transactions) { 
        localStorage.setItem('transactions', JSON.stringify(transactions)); 
    },
    getSettings: function() {
        try {
            return JSON.parse(localStorage.getItem('settings')) || null;
        } catch (e) {
            console.error('Error loading settings:', e);
            return null;
        }
    },
    saveSettings: function(settings) { 
        localStorage.setItem('settings', JSON.stringify(settings)); 
    },
    getLogs: function() {
        try {
            return JSON.parse(localStorage.getItem('logs')) || [];
        } catch (e) {
            console.error('Error loading logs:', e);
            return [];
        }
    },
    saveLogs: function(logs) { 
        localStorage.setItem('logs', JSON.stringify(logs)); 
    },
};

// --- CORE UTILITY AND INITIALIZATION ---
function generateSimpleId() {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
}

function showAlert(message, type) {
    type = type || 'info';
    var modal = document.getElementById('alert-modal');
    var messageEl = document.getElementById('alert-message');
    var iconEl = document.getElementById('alert-icon');
    var okBtn = document.getElementById('alert-ok-btn');

    messageEl.textContent = message;

    var iconHtml = '';
    if (type === 'success') iconHtml = '<i class="fas fa-check-circle text-5xl text-emerald-500"></i>';
    else if (type === 'error') iconHtml = '<i class="fas fa-times-circle text-5xl text-rose-500"></i>';
    else iconHtml = '<i class="fas fa-info-circle text-5xl text-sky-500"></i>';
    iconEl.innerHTML = iconHtml;

    modal.classList.remove('hidden');
    setTimeout(function() {
        modal.classList.add('opacity-100');
        modal.querySelector('.modal-content').classList.remove('scale-95');
    }, 10);

    okBtn.onclick = function() {
        modal.classList.remove('opacity-100');
        modal.querySelector('.modal-content').classList.add('scale-95');
        setTimeout(function() { modal.classList.add('hidden'); }, 300);
    };
}

var config = {};

// ... (rest of the JavaScript code from the original file)

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    initializeConfig();
    
    // Set today's date for transaction forms
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('receive-date').value = today;
    document.getElementById('withdraw-date').value = today;
    
    // Set default user if configured
    if (config.defaultUser) {
        document.getElementById('receive-person').value = config.defaultUser;
        document.getElementById('withdraw-person').value = config.defaultUser;
    }

    // Populate all select elements
    populateAllSelects();
    
    // Initialize inventory filters
    populateInventoryMachineFilter();
    populateInventoryLineFilter();
    
    // Initialize history filters
    populateHistoryMachineFilter();
    
    // Initialize export filters
    populateExportFilters();
    
    // Set initial page (dashboard)
    renderDashboard();
    
    // Check for low stock items
    var parts = db.getParts();
    var multiplier = config.lowStockMultiplier || 1.0;
    var lowStockItems = parts.filter(function(p) {
        return p.stock <= p.minStock * multiplier;
    });
    
    if (lowStockItems.length > 0) {
        showLowStockAlert(lowStockItems);
    }

    // Add event listeners for machinery filters
    document.getElementById('receive-machinery').addEventListener('change', updateReceivePartCodeSuggestion);
    document.getElementById('receive-production-line').addEventListener('change', updateReceivePartCodeSuggestion);
    
    document.getElementById('withdraw-machinery').addEventListener('change', function() {
        populateTransactionPartSelect(this.value);
    });

    // Add event listeners for search/filter inputs
    document.getElementById('history-search').addEventListener('input', function() {
        renderHistory(
            this.value,
            document.getElementById('history-type-filter').value,
            document.getElementById('history-machine-filter').value
        );
    });

    document.getElementById('history-type-filter').addEventListener('change', function() {
        renderHistory(
            document.getElementById('history-search').value,
            this.value,
            document.getElementById('history-machine-filter').value
        );
    });

    document.getElementById('history-machine-filter').addEventListener('change', function() {
        renderHistory(
            document.getElementById('history-search').value,
            document.getElementById('history-type-filter').value,
            this.value
        );
    });

    // Initialize inventory view
    document.getElementById('inventory-machine-filter').addEventListener('change', function() {
        renderInventory(this.value, document.getElementById('inventory-line-filter').value);
    });

    document.getElementById('inventory-line-filter').addEventListener('change', function() {
        renderInventory(document.getElementById('inventory-machine-filter').value, this.value);
    });

    renderInventory();

    // Master data form submission
    document.getElementById('master-data-form').addEventListener('submit', handleMasterDataSubmit);
});