// Firebase is initialized in HTML, use the global reference
let database = null;
let currentRole = null;
let currentUser = null;
let currentBarista = null;

// Wait for Firebase to initialize
let firebaseCheckAttempts = 0;
const firebaseInitCheck = setInterval(() => {
    if (window.firebaseDB) {
        database = window.firebaseDB;
        clearInterval(firebaseInitCheck);
        console.log('✅ Staff script: Firebase ready');
        // Initialize default baristas
        initializeDefaultBaristas();
    } else if (firebaseCheckAttempts > 30) {
        clearInterval(firebaseInitCheck);
        console.warn('⚠️ Firebase did not initialize. Using offline mode only.');
    }
    firebaseCheckAttempts++;
}, 100);

// Initialize default baristas
function initializeDefaultBaristas() {
    const defaultBarista = {
        name: 'kevin',
        password: 'eeettt123',
        createdAt: new Date().toISOString()
    };
    
    // Check if baristas exist in localStorage
    let baristas = localStorage.getItem('coffeeBaristas');
    let baristasList = baristas ? JSON.parse(baristas) : [];
    
    // Check if kevin already exists
    const kevinExists = baristasList.some(b => b.name === 'kevin');
    
    if (!kevinExists) {
        baristasList.push(defaultBarista);
        localStorage.setItem('coffeeBaristas', JSON.stringify(baristasList));
        console.log('✅ Default barista "kevin" created');
    }
    
    // Also add to Firebase if available
    if (database) {
        database.ref('baristas').once('value', function(snapshot) {
            const fbBaristas = snapshot.val() || {};
            const fbList = Object.values(fbBaristas);
            const kevinInFB = fbList.some(b => b.name === 'kevin');
            
            if (!kevinInFB) {
                database.ref('baristas').push(defaultBarista);
                console.log('✅ Default barista "kevin" added to Firebase');
            }
        });
    }
}

// Role Selection
function selectRole(role) {
    currentRole = role;
    document.getElementById('roleSelector').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('backRoleBtn').style.display = 'block';

    // Show/hide keyword field based on role
    const keywordGroup = document.querySelector('.keyword-group');
    
    // Change header and show relevant info based on role
    if (role === 'manager') {
        document.querySelector('.login-header h1').textContent = 'Manager Login';
        document.getElementById('baristaLoginInfo').style.display = 'none';
        if (keywordGroup) keywordGroup.style.display = 'block';
    } else {
        document.querySelector('.login-header h1').textContent = 'Barista Login';
        document.getElementById('baristaLoginInfo').style.display = 'block';
        if (keywordGroup) keywordGroup.style.display = 'none';
    }
}

function backToRoleSelection() {
    currentRole = null;
    document.getElementById('roleSelector').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('backRoleBtn').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').textContent = '';
}

// Login Handler
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const keyword = document.getElementById('keyword').value.trim();
    const errorDiv = document.getElementById('loginError');

    errorDiv.textContent = '';

    if (!username || !password) {
        errorDiv.textContent = '❌ Please fill in username and password.';
        return;
    }
    
    // Manager credentials - Biryani House
    const MANAGER_USERNAME = 'kevin';
    const MANAGER_PASSWORD = 'eeettt123';
    const MANAGER_KEYWORD = 'biryani';

    if (currentRole === 'manager') {
        // For manager, keyword is required
        const keywordInput = document.getElementById('keyword').value.trim() || 'biryani';
        if (username === MANAGER_USERNAME && password === MANAGER_PASSWORD && keywordInput === MANAGER_KEYWORD) {
            currentUser = username;
            sessionStorage.setItem('staffRole', 'manager');
            sessionStorage.setItem('staffUser', username);
            showManagerDashboard();
        } else {
            errorDiv.textContent = '❌ Invalid manager credentials.';
        }
    } else {
        // Barista - validate username and password against stored barista data
        // Also accept keyword 'biryani' for manager-level access
        const keywordInput = document.getElementById('keyword').value.trim();
        if (keywordInput === 'biryani' && username === MANAGER_USERNAME && password === MANAGER_PASSWORD) {
            // Manager logging in as barista - allow access
            currentUser = username;
            sessionStorage.setItem('staffRole', 'manager');
            sessionStorage.setItem('staffUser', username);
            showManagerDashboard();
        } else {
            validateBaristaLogin(username, password, errorDiv);
        }
    }
}

function validateBaristaLogin(baristaName, password, errorDiv) {
    // Check if barista exists in database and validate password
    if (database) {
        database.ref('baristas').once('value', function (snapshot) {
            const baristas = snapshot.val() || {};
            const baristasList = Object.values(baristas);
            // Check by username first, then by name
            const barista = baristasList.find(b => b.username === baristaName || b.name === baristaName);

            if (barista && barista.password === password) {
                // Barista found and password matches, login successful
                currentUser = barista.name;
                currentBarista = barista.name;
                sessionStorage.setItem('staffRole', 'barista');
                sessionStorage.setItem('staffUser', barista.name);
                sessionStorage.setItem('baristaName', barista.name);
                showBaristaDashboard();
            } else {
                // Barista not found or password mismatch, check localStorage
                validateBaristaLoginLocalStorage(baristaName, password, errorDiv);
            }
        }).catch(error => {
            console.error('Firebase error, checking localStorage:', error);
            validateBaristaLoginLocalStorage(baristaName, password, errorDiv);
        });
    } else {
        // Firebase not available, use localStorage
        validateBaristaLoginLocalStorage(baristaName, password, errorDiv);
    }
}

function validateBaristaLoginLocalStorage(baristaName, password, errorDiv) {
    try {
        let baristas = localStorage.getItem('coffeeBaristas');
        let baristasList = baristas ? JSON.parse(baristas) : [];
        // Check by username first, then by name
        const barista = baristasList.find(b => b.username === baristaName || b.name === baristaName);

        if (barista && barista.password === password) {
            // Barista found and password matches, login successful
            currentUser = barista.name;
            currentBarista = barista.name;
            sessionStorage.setItem('staffRole', 'barista');
            sessionStorage.setItem('staffUser', barista.name);
            sessionStorage.setItem('baristaName', barista.name);
            showBaristaDashboard();
        } else if (barista) {
            errorDiv.textContent = '❌ Incorrect password.';
        } else {
            errorDiv.textContent = '❌ Staff not found. Contact manager for credentials.';
            console.warn('Staff not found:', baristaName);
        }
    } catch (error) {
        errorDiv.textContent = '❌ Error validating staff.';
        console.error('Error validating staff:', error);
    }
}

// Show Manager Dashboard
function showManagerDashboard() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('managerDashboard').style.display = 'block';
    
    // Initialize announcements for manager dashboard
    initializeAnnouncements();

    // Load all orders and baristas
    loadManagerData();

    // Set today's date as default in the date filter
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dateFilterInput = document.getElementById('managerDateFilter');
    if (dateFilterInput) {
        dateFilterInput.value = dateStr;
        // Remove old listener if it exists
        const newDateFilterInput = dateFilterInput.cloneNode(true);
        dateFilterInput.parentNode.replaceChild(newDateFilterInput, dateFilterInput);
        
        // Add fresh listener
        document.getElementById('managerDateFilter').addEventListener('change', function (e) {
            // Parse date string in local timezone, not UTC
            const [year, month, day] = e.target.value.split('-');
            const selectedDate = new Date(year, month - 1, day);
            setManagerDateFilter(selectedDate);
        });
    }

    // Event listeners - remove old and add fresh
    const manageBaristaBtn = document.getElementById('manageBaristaBtn');
    const refreshManagerBtn = document.getElementById('refreshManagerBtn');
    
    if (manageBaristaBtn) {
        manageBaristaBtn.onclick = null;
        manageBaristaBtn.addEventListener('click', showBaristaManagementModal);
    }
    
    if (refreshManagerBtn) {
        refreshManagerBtn.onclick = null;
        refreshManagerBtn.addEventListener('click', loadManagerData);
    }
    document.getElementById('closeBaristaModal').addEventListener('click', () => {
        document.getElementById('baristaManagementModal').style.display = 'none';
    });
    document.getElementById('closeAssignmentModal').addEventListener('click', () => {
        document.getElementById('orderAssignmentModal').style.display = 'none';
    });

    console.log('✅ Manager Dashboard Loaded');
}

// Show Barista Dashboard (for assigned orders)
function showBaristaDashboard() {
    console.log('🔍 showBaristaDashboard called, currentBarista:', currentBarista);

    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('managerDashboard').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';

    const headerH1 = document.querySelector('.dashboard-header h1');
    if (headerH1) {
        headerH1.textContent = `Barista: ${currentBarista}`;
    }

    // Load only orders assigned to this barista
    console.log('📋 About to call loadBaristaOrders for:', currentBarista);
    loadBaristaOrders();

    // Remove old listeners to avoid duplicates
    const refreshBtn = document.getElementById('refreshBtn');
    const clearBtn = document.getElementById('clearCompletedBtn');

    if (refreshBtn) {
        refreshBtn.onclick = null;
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Refresh clicked');
            loadBaristaOrders();
        });
    }

    if (clearBtn) {
        clearBtn.onclick = null;
        clearBtn.addEventListener('click', clearCompletedOrders);
    }

    console.log('✅ Barista Dashboard Loaded for:', currentBarista);
}

// MANAGER FUNCTIONS
let ordersRef = null;
let baristasRef = null;
let selectedManagerDate = null; // Track selected date filter

function getStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getEndOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

function loadManagerData() {
    // Try Firebase first, fallback to localStorage
    if (database) {
        loadManagerDataFromFirebase();
    } else {
        loadManagerDataFromLocalStorage();
    }
}

function loadManagerDataFromFirebase() {
    if (!database) {
        console.warn('Firebase not available, falling back to localStorage');
        loadManagerDataFromLocalStorage();
        return;
    }

    try {
        // Remove old listeners
        if (ordersRef) ordersRef.off();
        if (baristasRef) baristasRef.off();

        // Load all orders with real-time updates
        ordersRef = database.ref('orders');
        ordersRef.on('value', function (snapshot) {
            const orders = snapshot.val() || {};
            const ordersList = Object.values(orders);

            console.log('📦 Manager loaded orders:', ordersList.length);

            // Update stats
            document.getElementById('totalOrdersManager').textContent = ordersList.length;
            document.getElementById('pendingOrdersManager').textContent = ordersList.filter(o => !o.status || o.status === 'pending' || o.status === 'active').length;
            document.getElementById('completedOrdersManager').textContent = ordersList.filter(o => o.status === 'completed').length;

            // Display orders
            renderManagerOrders(ordersList);
        }, function (error) {
            console.error('Firebase orders read error:', error);
            loadManagerDataFromLocalStorage();
        });

        // Load baristas with real-time updates
        baristasRef = database.ref('baristas');
        baristasRef.on('value', function (snapshot) {
            const baristas = snapshot.val() || {};
            const baristasList = Object.values(baristas);
            renderBaristasList(baristasList);
        }, function (error) {
            console.error('Firebase baristas read error:', error);
        });
    } catch (error) {
        console.error('Error setting up Firebase listeners:', error);
        loadManagerDataFromLocalStorage();
    }
}

function loadManagerDataFromLocalStorage() {
    try {
        const storedOrders = localStorage.getItem('coffeeOrders');
        const storedBaristas = localStorage.getItem('coffeeBaristas');

        const ordersList = storedOrders ? JSON.parse(storedOrders) : [];
        const baristasList = storedBaristas ? JSON.parse(storedBaristas) : [];

        console.log('📱 Loaded manager data from localStorage');

        // Update stats
        document.getElementById('totalOrdersManager').textContent = ordersList.length;
        document.getElementById('pendingOrdersManager').textContent = ordersList.filter(o => !o.status || o.status === 'pending' || o.status === 'active').length;
        document.getElementById('completedOrdersManager').textContent = ordersList.filter(o => o.status === 'completed').length;

        // Display orders and baristas
        renderManagerOrders(ordersList);
        renderBaristasList(baristasList);
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

function renderManagerOrders(orders) {
    const container = document.getElementById('managerOrdersContainer');

    if (orders.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 30px; color: #999;">No orders yet</div>';
        return;
    }

    container.innerHTML = '';

    // Filter orders by selected date (if any) and exclude archived orders
    let filteredOrders = [...orders].filter(order => !order.archived);
    if (selectedManagerDate) {
        const startOfDay = getStartOfDay(selectedManagerDate);
        const endOfDay = getEndOfDay(selectedManagerDate);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderTime);
            return orderDate >= startOfDay && orderDate <= endOfDay;
        });
    } else {
        // Default: show today's orders
        const today = new Date();
        const startOfDay = getStartOfDay(today);
        const endOfDay = getEndOfDay(today);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderTime);
            return orderDate >= startOfDay && orderDate <= endOfDay;
        });
    }

    // Sort orders by most recent first
    const sortedOrders = filteredOrders.reverse();

    sortedOrders.forEach(order => {
        const orderCard = document.createElement('div');
        const statusColor = getStatusColor(order.status);

        orderCard.style.cssText = `
            background: #fff;
            border-left: 5px solid ${statusColor};
            padding: 15px;
            margin-bottom: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        `;

        const orderTime = new Date(order.orderTime);
        const timeStr = orderTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const dateStr = orderTime.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        const assignButton = order.assignedTo
            ? `<p style="margin: 5px 0; color: #4CAF50; font-weight: bold;">✓ Assigned to: ${order.assignedTo}</p>`
            : `<button onclick="openOrderAssignmentModal('${order.id}', '${order.itemName}', '${order.customerName}')" style="padding: 8px 15px; background: #d4a574; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">👉 Assign to Barista</button>`;

        const deleteButton = order.status === 'completed'
            ? `<button onclick="deleteCompletedOrder('${order.id}')" style="padding: 8px 15px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-left: 10px;">🗑️ Delete</button>`
            : '';

        orderCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <strong style="font-size: 1.1rem; color: #3e2723;">${order.itemName}</strong>
                    <p style="margin: 8px 0 5px 0; color: #666; font-size: 0.9rem;">⏰ ${dateStr} ${timeStr}</p>
                    <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">👤 ${order.customerName}</p>
                    <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">📱 ${order.customerPhone}</p>
                    <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">💰 ${order.itemPrice} | ⏳ ${order.pickupMinutes} min</p>
                    <p style="margin: 8px 0 5px 0; color: ${getStatusColorText(order.status)}; font-weight: bold;">Status: ${order.status.toUpperCase()}</p>
                    <div style="display: flex; align-items: center;">
                        ${assignButton}
                        ${deleteButton}
                    </div>
                </div>
            </div>
        `;

        orderCard.addEventListener('mouseenter', () => {
            orderCard.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            orderCard.style.transform = 'translateX(5px)';
        });

        orderCard.addEventListener('mouseleave', () => {
            orderCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            orderCard.style.transform = 'translateX(0)';
        });

        container.appendChild(orderCard);
    });
}

function getStatusColorText(status) {
    const colors = {
        'pending': '#FF9800',
        'active': '#FF9800',
        'assigned': '#2196F3',
        'completed': '#4CAF50',
        'ready': '#4CAF50'
    };
    return colors[status] || '#666';
}

function renderBaristasList(baristas) {
    const container = document.getElementById('baristasListContainer');

    if (baristas.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No baristas yet. Add one to get started.</p>';
        return;
    }

    container.innerHTML = '';

    baristas.forEach(barista => {
        const baristaDiv = document.createElement('div');
        baristaDiv.style.cssText = `
            padding: 10px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #f5e6d3, #fff);
            border-radius: 8px;
            border: 1px solid #d4a574;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        baristaDiv.innerHTML = `
            <div>
                <strong>👨‍💼 ${barista.name}</strong>
                <p style="margin: 3px 0; color: #666; font-size: 0.85rem;">Orders: ${barista.assignedOrders || 0}</p>
            </div>
            <button onclick="deleteBarista('${barista.id}')" style="padding: 5px 10px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">Delete</button>
        `;

        container.appendChild(baristaDiv);
    });
}

function showBaristaManagementModal() {
    document.getElementById('baristaManagementModal').style.display = 'block';
    loadBaristaList();
}

function closeBaristaManagementModal() {
    document.getElementById('baristaManagementModal').style.display = 'none';
}

function loadBaristaList() {
    const container = document.getElementById('baristaListInModal');

    // Try Firebase first
    if (database) {
        database.ref('baristas').once('value', function (snapshot) {
            const baristas = snapshot.val() || {};
            const baristasList = Object.values(baristas);
            renderBaristaListUI(baristasList, container);
        }).catch(error => {
            console.error('Firebase error, loading from localStorage:', error);
            loadBaristaListFromLocalStorage();
        });
    } else {
        // Use localStorage fallback
        loadBaristaListFromLocalStorage();
    }
}

function loadBaristaListFromLocalStorage() {
    try {
        let baristas = localStorage.getItem('coffeeBaristas');
        let baristasList = baristas ? JSON.parse(baristas) : [];
        const container = document.getElementById('baristaListInModal');
        renderBaristaListUI(baristasList, container);
    } catch (error) {
        console.error('Error loading baristas:', error);
    }
}

function renderBaristaListUI(baristasList, container) {
    if (!container) return;

    if (baristasList.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px; background: #f5f5f5; border-radius: 8px;">No baristas added yet.</div>';
        return;
    }

    container.innerHTML = '';

    baristasList.forEach((barista, index) => {
        const div = document.createElement('div');
        div.style.cssText = `
            padding: 15px;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #f5e6d3, #fff);
            border-radius: 10px;
            border-left: 4px solid #d4a574;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        `;

        div.innerHTML = `
            <div style="flex: 1;">
                <strong style="color: #3e2723; font-size: 1.05rem;">👨‍💼 ${barista.name}</strong>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">Orders: ${barista.assignedOrders || 0}</p>
            </div>
            <button onclick="deleteBarista('${barista.id}')" style="padding: 8px 15px; background: linear-gradient(135deg, #ff6b6b, #ff5252); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: 'Dancing Script', cursive; transition: all 0.3s ease;">Delete</button>
        `;

        div.addEventListener('mouseenter', () => {
            div.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            div.style.transform = 'translateX(5px)';
        });

        div.addEventListener('mouseleave', () => {
            div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            div.style.transform = 'translateX(0)';
        });

        container.appendChild(div);
    });
}

function addBarista() {
    const name = document.getElementById('baristaNameInput').value.trim();
    const username = document.getElementById('baristaUsernameInput').value.trim();
    const password = document.getElementById('baristaPasswordInput').value.trim();

    if (!name) {
        showAddBaristaError('Please enter staff name');
        return;
    }
    if (!username) {
        showAddBaristaError('Please enter username');
        return;
    }
    if (!password) {
        showAddBaristaError('Please enter password');
        return;
    }

    const baristaId = Date.now().toString();
    const baristaData = {
        id: baristaId,
        name: name,
        username: username,
        password: password,
        createdAt: new Date().toISOString(),
        assignedOrders: 0
    };

    // Try Firebase first
    if (database) {
        database.ref('baristas/' + baristaId).set(baristaData).then(() => {
            document.getElementById('baristaNameInput').value = '';
            document.getElementById('baristaUsernameInput').value = '';
            document.getElementById('baristaPasswordInput').value = '';
            showAddBaristaSuccess('Staff added successfully!');
            setTimeout(() => {
                loadBaristaList();
                loadManagerData();
            }, 500);
        }).catch(error => {
            console.error('Firebase error, trying localStorage:', error);
            addBaristaToLocalStorage(baristaData);
        });
    } else {
        // Use localStorage fallback
        addBaristaToLocalStorage(baristaData);
    }
}

function addBaristaToLocalStorage(baristaData) {
    try {
        let baristas = localStorage.getItem('coffeeBaristas');
        let baristasList = baristas ? JSON.parse(baristas) : [];
        baristasList.push(baristaData);
        localStorage.setItem('coffeeBaristas', JSON.stringify(baristasList));

        document.getElementById('baristaNameInput').value = '';
        document.getElementById('baristaUsernameInput').value = '';
        document.getElementById('baristaPasswordInput').value = '';
        showAddBaristaSuccess('Staff added (offline mode)');
        setTimeout(() => {
            loadBaristaList();
            loadManagerData();
        }, 500);
    } catch (error) {
        showAddBaristaError('Error: ' + error.message);
        console.error('Error adding barista:', error);
    }
}

function showAddBaristaError(message) {
    // Add animation styles if not already present
    if (!document.getElementById('notificationAnimations')) {
        const style = document.createElement('style');
        style.id = 'notificationAnimations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f44336, #d32f2f);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        font-family: 'Dancing Script', cursive;
        animation: slideIn 0.3s ease;
    `;
    errorDiv.textContent = '❌ ' + message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

function showAddBaristaSuccess(message) {
    // Add animation styles if not already present
    if (!document.getElementById('notificationAnimations')) {
        const style = document.createElement('style');
        style.id = 'notificationAnimations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        font-family: 'Dancing Script', cursive;
        animation: slideIn 0.3s ease;
    `;
    successDiv.textContent = '✅ ' + message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

function deleteBarista(baristaId) {
    if (confirm('Are you sure you want to delete this barista?')) {
        const db = database || window.firebaseDB;

        if (!db) {
            showAddBaristaError('Firebase not available');
            return;
        }

        db.ref('baristas/' + baristaId).remove().then(() => {
            showAddBaristaSuccess('Barista deleted successfully');
            setTimeout(() => {
                loadBaristaList();
                loadManagerData();
            }, 500);
        }).catch(error => {
            showAddBaristaError('Error: ' + error.message);
        });
    }
}

function openOrderAssignmentModal(orderId, itemName, customerName) {
    const modal = document.getElementById('orderAssignmentModal');
    document.getElementById('assignmentOrderInfo').innerHTML = `
        <strong>Order:</strong> ${itemName}<br>
        <small style="color: #666;">Customer: ${customerName || 'N/A'}</small><br>
        <small style="color: #999;">Order ID: ${orderId}</small>
    `;

    // Store current order ID for assignment
    window.currentOrderToAssign = orderId;

    // Load baristas into select
    loadBaristasForAssignment();

    modal.style.display = 'block';
}

function loadBaristasForAssignment() {
    const select = document.getElementById('baristaAssignmentSelect');
    select.innerHTML = '<option value="">Loading baristas...</option>';

    if (database) {
        database.ref('baristas').once('value', function (snapshot) {
            const baristas = snapshot.val() || {};
            const baristasList = Object.values(baristas);

            if (baristasList.length === 0) {
                // Try localStorage fallback
                loadBaristasFromLocalStorageForAssignment();
                return;
            }

            select.innerHTML = '<option value="">👨‍💼 Choose a barista...</option>';
            baristasList.forEach(barista => {
                const option = document.createElement('option');
                option.value = barista.id + '|' + barista.name;
                option.textContent = `${barista.name} (${barista.assignedOrders || 0} orders)`;
                select.appendChild(option);
            });
        }).catch(error => {
            console.error('Error loading from Firebase:', error);
            loadBaristasFromLocalStorageForAssignment();
        });
    } else {
        loadBaristasFromLocalStorageForAssignment();
    }
}

function loadBaristasFromLocalStorageForAssignment() {
    const select = document.getElementById('baristaAssignmentSelect');

    try {
        let baristas = localStorage.getItem('coffeeBaristas');
        let baristasList = baristas ? JSON.parse(baristas) : [];

        if (baristasList.length === 0) {
            select.innerHTML = '<option value="">No baristas available. Please add baristas first.</option>';
            console.warn('No baristas found in localStorage');
            return;
        }

        select.innerHTML = '<option value="">👨‍💼 Choose a barista...</option>';
        baristasList.forEach(barista => {
            const option = document.createElement('option');
            option.value = barista.id + '|' + barista.name;
            option.textContent = `${barista.name} (${barista.assignedOrders || 0} orders)`;
            select.appendChild(option);
        });
    } catch (error) {
        select.innerHTML = '<option value="">Error loading baristas</option>';
        console.error('Error loading baristas from localStorage:', error);
    }
}

function confirmAssignment() {
    const select = document.getElementById('baristaAssignmentSelect');
    const valueParts = select.value.split('|');
    const baristaId = valueParts[0];
    const baristaName = valueParts[1];

    if (!baristaName) {
        showAddBaristaError('❌ Please select a barista');
        return;
    }

    const orderId = window.currentOrderToAssign;

    if (database) {
        // Try Firebase first
        database.ref('orders/' + orderId).update({
            assignedTo: baristaName,
            assignedAt: new Date().toISOString(),
            status: 'assigned'
        }).then(() => {
            // Update barista's assigned orders count
            database.ref('baristas/' + baristaId).once('value', function (snapshot) {
                const barista = snapshot.val();
                const newCount = (barista.assignedOrders || 0) + 1;
                database.ref('baristas/' + baristaId).update({
                    assignedOrders: newCount
                });
            });

            showAddBaristaSuccess('✅ Order assigned to ' + baristaName);
            document.getElementById('orderAssignmentModal').style.display = 'none';
            loadManagerData();
        }).catch(error => {
            console.error('Firebase assignment error, trying localStorage:', error);
            assignOrderToLocalStorage(orderId, baristaId, baristaName);
        });
    } else {
        assignOrderToLocalStorage(orderId, baristaId, baristaName);
    }
}

function assignOrderToLocalStorage(orderId, baristaId, baristaName) {
    try {
        // Update order
        let orders = localStorage.getItem('coffeeOrders');
        let ordersList = orders ? JSON.parse(orders) : [];
        const order = ordersList.find(o => o.id === orderId);
        if (order) {
            order.assignedTo = baristaName;
            order.assignedAt = new Date().toISOString();
            order.status = 'assigned';
            localStorage.setItem('coffeeOrders', JSON.stringify(ordersList));
        }

        // Update barista order count
        let baristas = localStorage.getItem('coffeeBaristas');
        let baristasList = baristas ? JSON.parse(baristas) : [];
        const barista = baristasList.find(b => b.id === baristaId);
        if (barista) {
            barista.assignedOrders = (barista.assignedOrders || 0) + 1;
            localStorage.setItem('coffeeBaristas', JSON.stringify(baristasList));
        }

        showAddBaristaSuccess('✅ Order assigned to ' + baristaName + ' (offline)');
        document.getElementById('orderAssignmentModal').style.display = 'none';
        loadManagerData();
    } catch (error) {
        showAddBaristaError('❌ Error assigning order: ' + error.message);
        console.error('Error in localStorage assignment:', error);
    }
}

function deleteCompletedOrder(orderId) {
    if (confirm('Delete this completed order?')) {
        if (database) {
            // Try Firebase first
            database.ref('orders/' + orderId).remove().then(() => {
                showAddBaristaSuccess('✅ Order deleted successfully');
                loadManagerData();
            }).catch(error => {
                console.error('Firebase delete error, trying localStorage:', error);
                deleteOrderFromLocalStorage(orderId);
            });
        } else {
            deleteOrderFromLocalStorage(orderId);
        }
    }
}

function deleteOrderFromLocalStorage(orderId) {
    try {
        let orders = localStorage.getItem('coffeeOrders');
        let ordersList = orders ? JSON.parse(orders) : [];
        ordersList = ordersList.filter(o => o.id !== orderId);
        localStorage.setItem('coffeeOrders', JSON.stringify(ordersList));
        showAddBaristaSuccess('✅ Order deleted successfully');
        loadManagerData();
    } catch (error) {
        showAddBaristaError('❌ Error deleting order: ' + error.message);
        console.error('Error deleting order:', error);
    }
}

function setManagerDateFilter(date) {
    selectedManagerDate = date;
    loadManagerData();
}

function resetManagerDateFilter() {
    selectedManagerDate = null;
    
    // Update the date input to today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dateFilterInput = document.getElementById('managerDateFilter');
    if (dateFilterInput) {
        dateFilterInput.value = dateStr;
    }
    
    loadManagerData();
}

function getStatusColor(status) {
    const colors = {
        'pending': '#FFC107',
        'active': '#FFC107',
        'assigned': '#2196F3',
        'completed': '#4CAF50',
        'ready': '#4CAF50'
    };
    return colors[status] || '#999';
}

// BARISTA FUNCTIONS
let baristaOrdersListener = null;

function loadBaristaOrders() {
    if (!currentBarista) {
        console.warn('⚠️ Current barista not set');
        return;
    }

    console.log('📋 Loading orders for barista:', currentBarista);

    if (database) {
        try {
            // Remove old listener
            if (baristaOrdersListener) {
                baristaOrdersListener.off();
            }

            baristaOrdersListener = database.ref('orders').on('value', function (snapshot) {
                const allOrders = snapshot.val() || {};
                const myOrders = Object.keys(allOrders)
                    .filter(key => allOrders[key].assignedTo === currentBarista)
                    .map(key => ({ ...allOrders[key], id: key }));

                console.log('✅ Firebase loaded', myOrders.length, 'orders for', currentBarista);

                // Update stats
                document.getElementById('totalOrders').textContent = myOrders.length;
                document.getElementById('activeOrders').textContent = myOrders.filter(o => o.status !== 'completed').length;
                document.getElementById('completedOrders').textContent = myOrders.filter(o => o.status === 'completed').length;

                // Display orders
                renderBaristaOrderCards(myOrders);
            }, function (error) {
                console.error('Firebase error:', error);
                loadBaristaOrdersFromLocalStorage();
            });
        } catch (error) {
            console.error('Error setting up Firebase listener:', error);
            loadBaristaOrdersFromLocalStorage();
        }
    } else {
        console.log('📱 Firebase not available, using localStorage');
        loadBaristaOrdersFromLocalStorage();
    }
}

function loadBaristaOrdersFromLocalStorage() {
    try {
        const stored = localStorage.getItem('coffeeOrders');
        const allOrders = stored ? JSON.parse(stored) : [];
        const myOrders = allOrders.filter(order => order.assignedTo === currentBarista);

        console.log('✅ localStorage loaded', myOrders.length, 'orders for', currentBarista);

        // Update stats
        document.getElementById('totalOrders').textContent = myOrders.length;
        document.getElementById('activeOrders').textContent = myOrders.filter(o => o.status !== 'completed').length;
        document.getElementById('completedOrders').textContent = myOrders.filter(o => o.status === 'completed').length;

        // Display orders
        renderBaristaOrderCards(myOrders);
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('activeOrders').textContent = '0';
        document.getElementById('completedOrders').textContent = '0';
    }
}

function renderBaristaOrderCards(orders) {
    const container = document.getElementById('ordersContainer');

    if (orders.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        container.innerHTML = '';
        return;
    }

    document.getElementById('emptyState').style.display = 'none';
    container.innerHTML = '';

    orders.forEach((order, index) => {
        const card = createBaristaOrderCard(order, index, orders.length);
        container.appendChild(card);
    });
}

function createBaristaOrderCard(order, index, total) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.id = `order-${order.id}`;

    const isCompleted = order.status === 'completed';

    card.innerHTML = `
        <div class="order-card-header">
            <span class="order-number">Order #${total - index}</span>
            <span style="color: ${isCompleted ? '#4CAF50' : '#FFC107'}; font-weight: bold;">${order.status.toUpperCase()}</span>
        </div>
        <div class="order-item-name">${order.itemName}</div>
        <div class="order-price">${order.itemPrice}</div>
        <div class="order-customer-info">👤 ${order.customerName}</div>
        <div class="order-customer-info">📱 ${order.customerPhone}</div>
        ${order.specialInstructions ? `<div class="order-customer-info">📝 ${order.specialInstructions}</div>` : ''}
        <div style="margin-top: 15px;">
            ${!isCompleted ? `<button onclick="markOrderComplete('${order.id}')" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">✓ Mark Complete</button>` : '<div style="padding: 12px; background: #4CAF50; color: white; text-align: center; border-radius: 8px; font-weight: bold;">✓ Order Completed</div>'}
        </div>
    `;

    return card;
}

function markOrderComplete(orderId) {
    if (confirm('Mark this order as complete?')) {
        if (database) {
            database.ref('orders/' + orderId).update({
                status: 'completed',
                completedAt: new Date().toISOString(),
                completedBy: currentBarista
            }).then(() => {
                alert('✅ Order marked as complete! Customer has been notified.');
                loadBaristaOrders();
            }).catch(error => {
                console.error('Firebase error:', error);
                markOrderCompleteLocal(orderId);
            });
        } else {
            markOrderCompleteLocal(orderId);
        }
    }
}

function markOrderCompleteLocal(orderId) {
    try {
        const stored = localStorage.getItem('coffeeOrders');
        let orders = stored ? JSON.parse(stored) : [];
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'completed';
            order.completedAt = new Date().toISOString();
            order.completedBy = currentBarista;
            localStorage.setItem('coffeeOrders', JSON.stringify(orders));
            alert('✅ Order marked as complete! (offline mode)');
            loadBaristaOrders();
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
        console.error('Error marking order complete:', error);
    }
}

function clearCompletedOrders() {
    if (confirm('Delete all your completed orders?')) {
        if (database) {
            database.ref('orders').once('value', function (snapshot) {
                const allOrders = snapshot.val() || {};
                // Only delete orders assigned to this barista
                const completedIds = Object.keys(allOrders).filter(key =>
                    allOrders[key].status === 'completed' && allOrders[key].assignedTo === currentBarista
                );

                completedIds.forEach(id => {
                    database.ref('orders/' + id).remove();
                });

                alert('✅ Your completed orders cleared');
                loadBaristaOrders();
            }).catch(error => {
                console.error('Firebase error:', error);
                clearCompletedOrdersLocal();
            });
        } else {
            clearCompletedOrdersLocal();
        }
    }
}

function clearCompletedOrdersLocal() {
    try {
        const stored = localStorage.getItem('coffeeOrders');
        let orders = stored ? JSON.parse(stored) : [];
        // Only keep non-completed orders for this barista
        orders = orders.filter(o => !(o.status === 'completed' && o.assignedTo === currentBarista));
        localStorage.setItem('coffeeOrders', JSON.stringify(orders));
        alert('✅ Your completed orders cleared');
        loadBaristaOrders();
    } catch (error) {
        alert('❌ Error clearing orders');
        console.error('Error:', error);
    }
}

// Logout Functions
function logoutBarista() {
    sessionStorage.clear();
    currentUser = null;
    currentBarista = null;
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('loginModal').style.display = 'block';
    backToRoleSelection();
}

function logoutManager() {
    sessionStorage.clear();
    currentUser = null;
    document.getElementById('managerDashboard').style.display = 'none';
    document.getElementById('loginModal').style.display = 'block';
    backToRoleSelection();
}

// Daily Order Reset - Clear completed orders at midnight
function startDailyResetTimer() {
    function scheduleNextReset() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const timeUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
            // At midnight, archive old completed orders
            archiveCompletedOrders();
            // Schedule the next reset
            scheduleNextReset();
        }, timeUntilMidnight);

        console.log('⏰ Next daily reset scheduled in', Math.round(timeUntilMidnight / 60000), 'minutes');
    }

    scheduleNextReset();
}

// Archive completed orders (keep them but mark as archived for a fresh new day)
function archiveCompletedOrders() {
    console.log('🗂️ Archiving completed orders from previous day...');

    if (database) {
        database.ref('orders').once('value', function (snapshot) {
            const orders = snapshot.val() || {};
            Object.keys(orders).forEach(key => {
                const order = orders[key];
                // Mark completed orders from yesterday as archived (they won't show in today's view)
                if (order.status === 'completed') {
                    database.ref('orders/' + key).update({
                        archived: true,
                        archivedAt: new Date().toISOString()
                    });
                }
            });
            console.log('✅ Completed orders archived for new day');
        }).catch(error => {
            console.error('Error archiving orders:', error);
        });
    }
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function () {
    const savedRole = sessionStorage.getItem('staffRole');
    const savedUser = sessionStorage.getItem('staffUser');

    // Start daily reset timer
    startDailyResetTimer();

    if (savedRole === 'manager' && savedUser) {
        currentUser = savedUser;
        showManagerDashboard();
    } else if (savedRole === 'barista' && savedUser) {
        currentUser = savedUser;
        currentBarista = sessionStorage.getItem('baristaName');
        showBaristaDashboard();
    }
});

// ===== ANNOUNCEMENT SYSTEM =====
let announcementTimeoutId = null;
let lastDisplayedAnnouncement = null;

function initializeAnnouncements() {
    loadLatestAnnouncement();
    // Listen for new announcements in real-time
    if (database) {
        database.ref('announcements').limitToLast(1).on('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const latestKey = Object.keys(data)[Object.keys(data).length - 1];
                const announcement = data[latestKey];
                if (announcement) {
                    displayAnnouncement(announcement.message, announcement.timestamp);
                }
            }
        });
    }
}

function loadLatestAnnouncement() {
    if (database) {
        database.ref('announcements').limitToLast(1).once('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const latestKey = Object.keys(data)[Object.keys(data).length - 1];
                const announcement = data[latestKey];
                if (announcement) {
                    displayAnnouncement(announcement.message, announcement.timestamp);
                }
            }
        });
    }
}

function displayAnnouncement(message, timestamp) {
    const notification = document.getElementById('announcementNotification');
    const content = document.getElementById('announcementContent');
    
    // Don't show the same announcement if already displayed
    if (lastDisplayedAnnouncement === message && notification.classList.contains('show')) {
        return;
    }
    lastDisplayedAnnouncement = message;
    
    content.innerHTML = `<p>${message}</p>`;
    notification.classList.add('show');
    notification.classList.remove('hide');

    // Make announcement dismissible on click
    notification.onclick = function() {
        closeAnnouncement();
    };

    // Clear existing timeout
    if (announcementTimeoutId) {
        clearTimeout(announcementTimeoutId);
    }

    // Auto-hide after 8 seconds (longer so user has time to read and click)
    announcementTimeoutId = setTimeout(() => {
        closeAnnouncement();
    }, 8000);
}

function closeAnnouncement() {
    const notification = document.getElementById('announcementNotification');
    notification.classList.add('hide');

    setTimeout(() => {
        notification.classList.remove('show', 'hide');
    }, 500);

    if (announcementTimeoutId) {
        clearTimeout(announcementTimeoutId);
        announcementTimeoutId = null;
    }
}

function submitAnnouncement(event) {
    event.preventDefault();
    const text = document.getElementById('announcementText').value.trim();

    if (!text) {
        showNotification('Please enter an announcement message', 'error');
        return;
    }

    if (text.length > 500) {
        showNotification('Message must be 500 characters or less', 'error');
        return;
    }

    if (database) {
        database.ref('announcements').push({
            message: text,
            timestamp: new Date().toISOString(),
            postedBy: currentUser || 'Manager'
        }, (error) => {
            if (error) {
                console.error('Error posting announcement:', error);
                showNotification('Error posting announcement', 'error');
            } else {
                closeAnnouncementModal();
                showNotification('Announcement posted!', 'success');
            }
        });
    } else {
        // Offline mode - use localStorage
        try {
            const announcement = {
                message: text,
                timestamp: new Date().toISOString(),
                postedBy: currentUser || 'Manager'
            };
            localStorage.setItem('lastAnnouncement', JSON.stringify(announcement));
            closeAnnouncementModal();
            displayAnnouncement(text, new Date().toISOString());
            showNotification('Announcement posted!', 'success');
        } catch (error) {
            console.error('Error posting announcement:', error);
            showNotification('Error posting announcement', 'error');
        }
    }
}

function closeAnnouncementModal() {
    document.getElementById('announcementModal').style.display = 'none';
    document.getElementById('announcementForm').reset();
}

function showNotification(message, type) {
    // Create a temporary notification
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2000;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        animation: slideDown 0.3s ease;
        background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'};
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Initialize announcements when page loads
window.addEventListener('load', () => {
    setTimeout(initializeAnnouncements, 500);

    // Setup announcement modal handlers
    const announcementModal = document.getElementById('announcementModal');
    const closeAnnouncementBtn = document.getElementById('closeAnnouncementModal');
    const postAnnouncementBtn = document.getElementById('postAnnouncementBtn');

    if (postAnnouncementBtn) {
        postAnnouncementBtn.addEventListener('click', () => {
            announcementModal.style.display = 'block';
        });
    }

    if (closeAnnouncementBtn) {
        closeAnnouncementBtn.addEventListener('click', () => {
            announcementModal.style.display = 'none';
        });
    }
});

// Contact info modal toggle for Barista Dashboard
function toggleContactInfo(event) {
    if (event) {
        event.preventDefault();
    }
    const modal = document.getElementById('contact-modal');
    if (modal && modal.style.display === 'none') {
        modal.style.display = 'flex';
    } else if (modal) {
        modal.style.display = 'none';
    }
}

// Contact info modal toggle for Manager Dashboard
function toggleContactInfoManager(event) {
    if (event) {
        event.preventDefault();
    }
    const modal = document.getElementById('contact-modal-manager');
    if (modal && modal.style.display === 'none') {
        modal.style.display = 'flex';
    } else if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside of it (Barista)
window.addEventListener('click', (event) => {
    const modal = document.getElementById('contact-modal');
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
});

// Close modal when clicking outside of it (Manager)
window.addEventListener('click', (event) => {
    const modal = document.getElementById('contact-modal-manager');
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
});
