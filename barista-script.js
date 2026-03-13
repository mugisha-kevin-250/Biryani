// Firebase is initialized in HTML, use the global reference
let database = window.firebaseDB || null;

// Barista Dashboard Script
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is available
    if (database) {
        console.log('✅ Firebase initialized successfully');
    } else {
        console.warn('⚠️ Firebase SDK not loaded. Using localStorage mode.');
    }
    // Login credentials - use staff password/keyword
    const VALID_PASSWORD = '[REDACTED:password]';
    const VALID_KEYWORD = 'koffi';
    
    // Login functionality
    const loginModal = document.getElementById('loginModal');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    let currentBaristaName = null;
    
    // Ensure login modal is centered
    if (loginModal) {
        loginModal.style.display = 'flex';
        loginModal.style.justifyContent = 'center';
        loginModal.style.alignItems = 'center';
    }
    
    // Handle login
    window.handleLogin = function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const keyword = document.getElementById('keyword').value.trim();
        
        loginError.textContent = '';
        
        // Validate password and keyword
        if (password === VALID_PASSWORD && keyword === VALID_KEYWORD) {
            // Now validate that this barista exists in the system
            validateBaristaExists(username);
        } else {
            loginError.textContent = '❌ Invalid password or keyword.';
        }
    };
    
    // Validate barista exists in Firebase or localStorage
    function validateBaristaExists(baristaName) {
        if (database) {
            database.ref('baristas').once('value', function(snapshot) {
                const baristas = snapshot.val() || {};
                const baristasList = Object.values(baristas);
                const baristaExists = baristasList.some(b => b.name === baristaName);
                
                if (baristaExists) {
                    loginSuccessful(baristaName);
                } else {
                    // Try localStorage fallback
                    validateBaristaExistsLocal(baristaName);
                }
            }).catch(error => {
                console.error('Firebase error:', error);
                validateBaristaExistsLocal(baristaName);
            });
        } else {
            validateBaristaExistsLocal(baristaName);
        }
    }
    
    function validateBaristaExistsLocal(baristaName) {
        try {
            let baristas = localStorage.getItem('coffeeBaristas');
            let baristasList = baristas ? JSON.parse(baristas) : [];
            const baristaExists = baristasList.some(b => b.name === baristaName);
            
            if (baristaExists) {
                loginSuccessful(baristaName);
            } else {
                document.getElementById('loginError').textContent = '❌ Barista "' + baristaName + '" not found. Use the name created by the manager.';
            }
        } catch (error) {
            document.getElementById('loginError').textContent = '❌ Error validating barista.';
            console.error('Error:', error);
        }
    }
    
    function loginSuccessful(baristaName) {
        currentBaristaName = baristaName;
        localStorage.setItem('baristaLoggedIn', 'true');
        localStorage.setItem('currentBaristaName', baristaName);
        loginModal.style.display = 'none';
        dashboardContainer.style.display = 'block';
        document.getElementById('loginError').textContent = '';
        
        // Clear form
        loginForm.reset();
        
        // Initialize dashboard with barista name
        initializeDashboard(baristaName);
    }
    
    // Add logout functionality
    window.logoutBarista = function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.setItem('baristaLoggedIn', 'false');
            location.reload();
        }
    };
    
    // Check if user is already logged in
    if (localStorage.getItem('baristaLoggedIn') === 'true') {
        const savedBaristaName = localStorage.getItem('currentBaristaName');
        currentBaristaName = savedBaristaName;
        loginModal.style.display = 'none';
        dashboardContainer.style.display = 'block';
        initializeDashboard(savedBaristaName);
    } else {
        loginModal.style.display = 'flex';
        dashboardContainer.style.display = 'none';
    }
    
    function initializeDashboard(baristaName) {
        // Update header with barista name
        const headerH1 = document.querySelector('.dashboard-header h1');
        if (headerH1) {
            headerH1.textContent = `Barista Dashboard - ${baristaName}`;
        }
        
        // Elements
        const ordersContainer = document.getElementById('ordersContainer');
        const emptyState = document.getElementById('emptyState');
        const totalOrdersEl = document.getElementById('totalOrders');
        const activeOrdersEl = document.getElementById('activeOrders');
        const completedOrdersEl = document.getElementById('completedOrders');
        const refreshBtn = document.getElementById('refreshBtn');
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');
        const notificationSound = document.getElementById('notificationSound');
        
        let orders = [];
        let countdownIntervals = {};
        let lastOrderCount = 0;
        let firebaseListener = null;
        
        // Load orders from Firebase in real-time
        function loadOrdersFromFirebase() {
            // Try Firebase first
            if (database) {
                try {
                    if (firebaseListener) {
                        firebaseListener.off();
                    }
                    
                    firebaseListener = database.ref('orders').on('value', function(snapshot) {
                        const data = snapshot.val();
                        const allOrders = data ? Object.values(data) : [];
                        
                        // Filter to only show orders assigned to this barista
                        const newOrders = allOrders.filter(order => order.assignedTo === currentBaristaName);
                        
                        // Check for new orders
                        if (newOrders.length > lastOrderCount) {
                            playNotification();
                            showToast('🔔 New order assigned to you!');
                        }
                        
                        lastOrderCount = newOrders.length;
                        orders = newOrders;
                        updateDisplay();
                    }, function(error) {
                        console.error('Firebase error:', error);
                        loadFromLocalStorageBarista();
                    });
                } catch (error) {
                    console.error('Error loading from Firebase:', error);
                    loadFromLocalStorageBarista();
                }
            } else {
                // Firebase not available, use localStorage
                loadFromLocalStorageBarista();
            }
        }
        
        // Load from localStorage (fallback for barista)
        function loadFromLocalStorageBarista() {
            try {
                const stored = localStorage.getItem('coffeeOrders');
                const allOrders = stored ? JSON.parse(stored) : [];
                // Filter to only show orders assigned to this barista
                orders = allOrders.filter(order => order.assignedTo === currentBaristaName);
                updateDisplay();
                console.log('📱 Loaded assigned orders from local storage (offline mode)');
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                orders = [];
                updateDisplay();
            }
        }
        
        // Initialize Firebase listener
        loadOrdersFromFirebase();
        
        // Refresh button
        refreshBtn.addEventListener('click', () => {
            loadOrdersFromFirebase();
            showToast('✅ Orders refreshed');
        });
        
        // Clear completed button
        clearCompletedBtn.addEventListener('click', () => {
            if (confirm('Clear all completed orders?')) {
                orders.forEach(order => {
                    if (order.status === 'completed' || order.status === 'ready') {
                        database.ref('orders/' + order.id).remove();
                    }
                });
                showToast('🗑️ Completed orders cleared');
            }
        });
        
        // Update display
        function updateDisplay() {
            // Clear intervals
            Object.values(countdownIntervals).forEach(interval => clearInterval(interval));
            countdownIntervals = {};
            
            // Update stats
            const activeCount = orders.filter(o => o.status === 'active').length;
            const completedCount = orders.filter(o => o.status === 'completed' || o.status === 'ready').length;
            
            totalOrdersEl.textContent = orders.length;
            activeOrdersEl.textContent = activeCount;
            completedOrdersEl.textContent = completedCount;
            
            // Show/hide empty state
            if (orders.length === 0) {
                emptyState.classList.remove('hidden');
                ordersContainer.innerHTML = '';
                return;
            } else {
                emptyState.classList.add('hidden');
            }
            
            // Render orders (newest first)
            ordersContainer.innerHTML = '';
            const sortedOrders = [...orders].reverse();
            
            sortedOrders.forEach((order, index) => {
                const orderCard = createOrderCard(order, orders.length - index);
                ordersContainer.appendChild(orderCard);
                
                if (order.status === 'active') {
                    startCountdown(order);
                }
            });
        }
        
        // Create order card
        function createOrderCard(order, orderNumber) {
            const card = document.createElement('div');
            card.className = `order-card-barista ${order.status === 'active' ? 'new-order' : 'completed'}`;
            card.id = `barista-order-${order.id}`;
            
            const orderTime = new Date(order.orderTime);
            const timeStr = orderTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const dateStr = orderTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            const isReady = order.status === 'ready' || order.status === 'completed';
            const remainingMs = new Date(order.endTime).getTime() - Date.now();
            
            card.innerHTML = `
                <span class="order-status-badge ${order.status === 'active' ? 'active' : 'completed'}">
                    ${order.status === 'active' ? '🔄 ACTIVE' : '✅ READY'}
                </span>
                
                <div class="order-header-barista">
                    <div class="order-number-barista">Order #${orderNumber}</div>
                    <div class="order-time">📅 ${dateStr} at ${timeStr}</div>
                </div>
                
                <div class="order-item-info">
                    <div class="item-name-barista">${order.itemName}</div>
                    <div class="item-price-barista">${order.itemPrice}</div>
                </div>
                
                <div class="customer-info-section">
                    <div class="customer-detail">
                        <strong>👤 Name:</strong>
                        <span>${order.customerName}</span>
                    </div>
                    <div class="customer-detail">
                        <strong>📱 Phone:</strong>
                        <span>${order.customerPhone}</span>
                    </div>
                    <div class="customer-detail">
                        <strong>⏰ Pickup:</strong>
                        <span>${order.pickupMinutes} minutes</span>
                    </div>
                </div>
                
                ${order.specialInstructions ? `
                    <div class="special-instructions">
                        📝 <strong>Special Instructions:</strong><br>
                        ${order.specialInstructions}
                    </div>
                ` : ''}
                
                <div class="countdown-barista ${isReady ? 'ready' : ''}" id="barista-countdown-${order.id}">
                    ${isReady ? '✅ ORDER READY!' : '<span class="countdown-time-barista">--:--</span><span class="countdown-label-barista">Time remaining</span>'}
                </div>
                
                <div class="order-actions">
                    <button class="action-btn mark-ready-btn" onclick="markOrderReady('${order.id}')" ${isReady ? 'disabled' : ''}>
                        ${isReady ? '✅ Completed' : '✓ Mark Ready'}
                    </button>
                    <button class="action-btn remove-order-btn" onclick="removeOrder('${order.id}')">
                        🗑️ Remove
                    </button>
                </div>
            `;
            
            return card;
        }
        
        // Start countdown
        function startCountdown(order) {
            const countdownEl = document.getElementById(`barista-countdown-${order.id}`);
            if (!countdownEl) return;
            
            const updateCountdown = () => {
                const now = Date.now();
                const endTime = new Date(order.endTime).getTime();
                const remainingMs = endTime - now;
                
                if (remainingMs <= 0) {
                    countdownEl.innerHTML = '✅ TIME UP - READY TO SERVE!';
                    countdownEl.classList.add('ready');
                    clearInterval(countdownIntervals[order.id]);
                    
                    // Auto-mark as ready when time is up
                    if (order.status === 'active') {
                        if (database) {
                            database.ref('orders/' + order.id + '/status').set('ready');
                        } else {
                            markOrderReadyLocal(order.id);
                        }
                    }
                    return;
                }
                
                const totalSeconds = Math.floor(remainingMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                
                countdownEl.innerHTML = `
                    <span class="countdown-time-barista">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</span>
                    <span class="countdown-label-barista">Time remaining</span>
                `;
            };
            
            updateCountdown();
            countdownIntervals[order.id] = setInterval(updateCountdown, 1000);
        }
        
        // Mark order ready
        window.markOrderReady = function(orderId) {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        if (database) {
        database.ref('orders/' + orderId + '/status').set('ready').then(() => {
            showToast(`✅ Order #${orders.length - orderIndex} marked as ready!`);
                playNotification();
        }).catch((error) => {
            console.error('Firebase update failed, trying localStorage:', error);
                markOrderReadyLocal(orderId);
                });
            } else {
                markOrderReadyLocal(orderId);
            }
        };
        
        // Mark order ready in localStorage
        function markOrderReadyLocal(orderId) {
        try {
            const stored = localStorage.getItem('coffeeOrders');
        let ordersList = stored ? JSON.parse(stored) : [];
        const order = ordersList.find(o => o.id === orderId);
        if (order) {
        order.status = 'ready';
        localStorage.setItem('coffeeOrders', JSON.stringify(ordersList));
            showToast('✅ Order marked as ready!');
                playNotification();
                    loadFromLocalStorageBarista();
                 }
             } catch (error) {
                 showToast('❌ Failed to update order');
                 console.error('Error updating order:', error);
             }
         }
         
         // Remove order
         window.removeOrder = function(orderId) {
             const orderIndex = orders.findIndex(o => o.id === orderId);
             if (orderIndex === -1) return;
             
             const orderNumber = orders.length - orderIndex;
             
             if (confirm(`Remove Order #${orderNumber}?`)) {
                 if (database) {
                     database.ref('orders/' + orderId).remove().then(() => {
                         showToast(`🗑️ Order #${orderNumber} removed`);
                     }).catch((error) => {
                         console.error('Firebase delete failed, trying localStorage:', error);
                         removeOrderLocal(orderId, orderNumber);
                     });
                 } else {
                     removeOrderLocal(orderId, orderNumber);
                 }
             }
         };
         
         // Remove order from localStorage
         function removeOrderLocal(orderId, orderNumber) {
             try {
                 const stored = localStorage.getItem('coffeeOrders');
                 let ordersList = stored ? JSON.parse(stored) : [];
                 ordersList = ordersList.filter(o => o.id !== orderId);
                 localStorage.setItem('coffeeOrders', JSON.stringify(ordersList));
                 showToast(`🗑️ Order #${orderNumber} removed`);
                 loadFromLocalStorageBarista();
             } catch (error) {
                 showToast('❌ Failed to remove order');
                 console.error('Error removing order:', error);
             }
         }
        
        // Play notification sound
        function playNotification() {
            try {
                notificationSound.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
                console.log('Audio not supported');
            }
        }
        
        // Show toast notification
        function showToast(message) {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #5c3d2e, #3e2723);
                color: #ffd89b;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-weight: bold;
                animation: slideInRight 0.3s ease;
                border: 2px solid #d4a574;
                max-width: 300px;
                font-size: 1.1rem;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        console.log('🎉 Barista Dashboard Loaded!');
        console.log('📊 Real-time order monitoring active');
        console.log('☁️ Firebase Realtime Database connected');
    }
});
