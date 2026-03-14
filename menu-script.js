// Firebase is initialized in HTML, use the global reference
let database = window.firebaseDB || null;

// MTN Mobile Money API Configuration
// Replace these with your actual MTN API credentials
const MTN_CONFIG = {
    apiKey: 'YOUR_MTN_API_KEY', // Replace with your MTN API Key
    apiSecret: 'YOUR_MTN_API_SECRET', // Replace with your MTN API Secret
    providerCallbackHost: 'YOUR_CALLBACK_URL', // Your callback URL
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY', // MTN Subscription Key
    environment: 'sandbox', // Use 'production' for live
    merchantId: 'YOUR_MERCHANT_ID' // Your merchant ID
};

// Generate unique Device ID for this device
function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', deviceId);
        console.log('🆔 New Device ID created:', deviceId);
    }
    return deviceId;
}

const currentDeviceId = getOrCreateDeviceId();

// Debounce function for search optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Internet image URLs for food items (using free CDN images)
const internetImageUrls = {
    'chicken biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop',
    'mutton biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=400&fit=crop',
    'prawn biryani': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop',
    'vegetable biryani': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    'egg biryani': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=400&fit=crop',
    'fish biryani': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop',
    'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=400&fit=crop',
    'palak paneer': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop',
    'chicken curry': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop',
    'naan': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop',
    'lassi': 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=400&fit=crop',
    'chai': 'https://images.unsplash.com/photo-1564890369478-c5c3b8f4a75c?w=400&h=400&fit=crop',
    'coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
    'juice': 'https://images.unsplash.com/photo-1600271886742-f0496f661860?w=400&h=400&fit=crop',
    'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop',
    'curry': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop',
    'tandoori': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop',
    'default': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop'
};

function getInternetImageUrl(itemName) {
    if (!itemName) return internetImageUrls['default'];
    const lowerName = itemName.toLowerCase();
    for (const key in internetImageUrls) {
        if (lowerName.includes(key)) {
            return internetImageUrls[key];
        }
    }
    return internetImageUrls['default'];
}

function showEmojiFallback(imgElement, itemName) {
    const emojiMap = {
        'chicken biryani': '🍗🍚',
        'mutton biryani': '🍖🍚',
        'prawn biryani': '🦐🍚',
        'vegetable biryani': '🥬🍚',
        'egg biryani': '🥚🍚',
        'fish biryani': '🐟🍚',
        'dam biryani': '👑🍚',
        'hyderabadi biryani': '👑🍚',
        'butter chicken': '🧈🍗',
        'palak paneer': '🥬🧀',
        'chicken curry': '🍗🍛',
        'mutton curry': '🍖🍛',
        'fish curry': '🐟🍛',
        'dal makhani': '🫘🍲',
        'paneer tikka masala': '🧀🍛',
        'chicken tikka masala': '🍗🍛',
        'chicken tandoori': '🔥🍗',
        'fish tandoori': '🔥🐟',
        'tandoori mix grill': '🔥🍖',
        'chicken 65': '🌶️🍗',
        'paneer tikka': '🧀🔥',
        'malai tikka': '🧈🔥',
        'brochettes': '🍢',
        'fried rice': '🍳🍚',
        'ugali fish': '🐟🌽',
        'isombe': '🍌🥬',
        'matoke': '🍌🍲',
        'akabanzi': '🐟🔥',
        'inyama': '🍖🌽',
        'street food': '🍜',
        'samosa': '🥟',
        'pakora': '🥬🍳',
        'paneer pakora': '🧀🍳',
        'chicken wings': '🍗',
        'spring rolls': '🥟',
        'hummus': '🫘🫓',
        'fish fingers': '🐟🍴',
        'onion rings': '🧅🍳',
        'garlic naan': '🧄🫓',
        'butter naan': '🧈🫓',
        'plain naan': '🫓',
        'roti': '🫓',
        'paratha': '🥐',
        'lachha paratha': '🥐',
        'kulcha': '🥐',
        'cheese naan': '🧀🫓',
        'mango lassi': '🥭🥤',
        'sweet lassi': '🥤',
        'salt lassi': '🧂🥤',
        'masala chai': '☕',
        'coffee': '☕',
        'fresh juice': '🧃',
        'soft drinks': '🥤',
        'water': '💧',
        'gulab jamun': '🍬',
        'rasgulla': '🍡',
        'gajar ka halwa': '🥕🍮',
        'kheer': '🍮',
        'ice cream': '🍨',
        'brownie': '🍫',
        'cheesecake': '🍰',
        'tiramisu': '☕🍰',
        'special thali': '🍛🥗',
        'family combo': '👨‍👩‍👧‍👦🍛',
        'couple date': '❤️🍛',
        'party platter': '🎉🍽️',
        'grill combo': '🔥🍛',
        'vegetarian feast': '🥬🍛'
    };
    
    const lowerName = itemName ? itemName.toLowerCase() : '';
    let emoji = '🍛';
    for (const [key, value] of Object.entries(emojiMap)) {
        if (lowerName.includes(key)) {
            emoji = value;
            break;
        }
    }
    
    const svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='#fff5e6'/><text x='75' y='90' font-size='80' text-anchor='middle'>${emoji}</text></svg>`;
    imgElement.src = 'data:image/svg+xml;base64,' + btoa(svgContent);
}

// Load and display announcements - DISABLED for now
// Customers will see order status updates only
/*
function loadAnnouncementsOnMenu() {
    if (database) {
        // Listen for latest announcement
        database.ref('announcements').limitToLast(1).on('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const latestKey = Object.keys(data)[Object.keys(data).length - 1];
                const announcement = data[latestKey];
                if (announcement) {
                    displayAnnouncementOnMenu(announcement.message);
                }
            }
        });
    }
}
*/

function displayAnnouncementOnMenu(message) {
    const notifPanel = document.getElementById('customerNotificationsPanel');
    const notifContent = document.getElementById('notificationsContent');

    if (!notifPanel || !notifContent) return;

    // Create announcement element
    const notif = document.createElement('div');
    notif.style.cssText = `
        padding: 15px;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #fff3cd, #fff8e1);
        border-left: 4px solid #ffc107;
        border-radius: 6px;
        font-size: 0.95rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    notif.innerHTML = `
        <strong style="color: #ff6f00;">📢 Shop Update</strong><br>
        <span style="color: #333;">${message}</span>
    `;

    // Clear old announcements and add new one at top
    const existingAnnouncements = notifContent.querySelectorAll('[data-type="announcement"]');
    existingAnnouncements.forEach(el => el.remove());

    notif.setAttribute('data-type', 'announcement');
    notifContent.insertBefore(notif, notifContent.firstChild);

    // Show notifications panel
    notifPanel.style.display = 'block';
}

// Menu functionality with Order System
function initializeMenu() {
    // Check if Firebase is available
    if (database) {
        console.log('✅ Firebase initialized successfully');
    } else {
        console.warn('⚠️ Firebase SDK not loaded. Using offline mode (localStorage).');
    }
    // Elements
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuSections = document.querySelectorAll('.menu-section');
    const menuItems = document.querySelectorAll('.menu-item');

    // Order modal elements
    const orderModal = document.getElementById('orderModal');
    const closeModal = document.getElementById('closeModal');
    const orderForm = document.getElementById('orderForm');
    const selectedItemName = document.getElementById('selectedItemName');
    const selectedItemPrice = document.getElementById('selectedItemPrice');

    // Payment modal elements
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const processPaymentBtn = document.getElementById('processPaymentBtn');
    const paymentItemName = document.getElementById('paymentItemName');
    const paymentItemPrice = document.getElementById('paymentItemPrice');
    const paymentItemImage = document.getElementById('paymentItemImage');
    const paymentAmount = document.getElementById('paymentAmount');
    const mtnPaymentSection = document.getElementById('mtnPaymentSection');
    const mtnPhoneInput = document.getElementById('mtnPhone');
    
    // Payment state
    let selectedPaymentMethod = 'mtn';

    // Active orders elements
    const activeOrdersContainer = document.getElementById('activeOrdersContainer');
    const activeOrdersList = document.getElementById('activeOrdersList');
    const floatingOrdersBtn = document.getElementById('floatingOrdersBtn');
    const closeOrdersBtn = document.getElementById('closeOrdersBtn');
    const orderCount = document.getElementById('orderCount');

    // Order tracking
    let orders = [];
    let selectedItem = null;
    let countdownIntervals = {};
    let firebaseListener = null;

    // Load orders from Firebase or localStorage fallback
    function loadOrdersFromFirebase() {
        // Try Firebase first
        if (database) {
            try {
                if (firebaseListener) {
                    firebaseListener.off();
                }
                firebaseListener = database.ref('orders').on('value', function (snapshot) {
                    const data = snapshot.val();
                    const allOrders = data ? Object.values(data) : [];
                    // Filter to only show orders from this device
                    orders = allOrders.filter(o => o.deviceId === currentDeviceId);
                    console.log('📱 Filtered orders for this device. Total in Firebase:', allOrders.length, 'This device:', orders.length);
                    updateOrdersDisplay();
                    checkForCompletedOrders();
                }, function (error) {
                    console.error('Firebase error:', error);
                    loadFromLocalStorage(); // Fallback
                });
            } catch (error) {
                console.error('Error loading from Firebase:', error);
                loadFromLocalStorage(); // Fallback
            }
        } else {
            // Firebase not available, use localStorage
            loadFromLocalStorage();
        }
    }

    // Check for completed orders and show notifications
    function checkForCompletedOrders() {
        orders.forEach(order => {
            if (order.status === 'completed' && !order.notificationShown) {
                showOrderCompletionNotification(order);
                // Mark notification as shown
                if (database) {
                    database.ref('orders/' + order.id).update({ notificationShown: true });
                }
            }
        });
    }

    // Show order completion notification
    function showOrderCompletionNotification(order) {
        const notifPanel = document.getElementById('customerNotificationsPanel');
        const notifContent = document.getElementById('notificationsContent');

        // Show panel if hidden
        notifPanel.style.display = 'block';

        // Create notification element
        const notif = document.createElement('div');
        notif.style.cssText = `
            padding: 12px;
            margin-bottom: 10px;
            background: #f5e6d3;
            border-left: 4px solid #4CAF50;
            border-radius: 6px;
            font-size: 0.95rem;
        `;

        notif.innerHTML = `
            <strong style="color: #4CAF50;">✓ Order Ready!</strong><br>
            <span style="color: #3e2723;">${order.itemName} for <strong>${order.customerName}</strong> is ready for pickup!</span>
        `;

        notifContent.insertBefore(notif, notifContent.firstChild);

        // Auto-remove notification after 10 seconds
        setTimeout(() => {
            notif.style.opacity = '0.5';
        }, 8000);
    }

    // Toggle notifications panel
    window.toggleNotificationsPanel = function () {
        const panel = document.getElementById('customerNotificationsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    // Load from localStorage (fallback)
    function loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('coffeeOrders');
            const allOrders = stored ? JSON.parse(stored) : [];
            // Filter to only show orders from this device
            orders = allOrders.filter(o => o.deviceId === currentDeviceId);
            updateOrdersDisplay();
            console.log('📱 Loaded orders from local storage (offline mode). This device orders:', orders.length);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            orders = [];
            updateOrdersDisplay();
        }
    }

    
    // Initialize menu item images with internet images
    function initializeMenuItemImages() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('.item-name').textContent.toLowerCase();
            const internetImageUrl = getInternetImageUrl(itemName);
            
            // Set data attribute for internet image
            item.setAttribute('data-internet-image', internetImageUrl);
            
            // Add image element if not exists
            if (!item.querySelector('.item-img')) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'item-img-container';
                
                const img = document.createElement('img');
                img.className = 'item-img';
                img.src = internetImageUrl;
                img.alt = itemName;
                img.loading = 'lazy';
                
                // Handle image load error
                img.onerror = function() {
                    this.style.display = 'none';
                };
                
                // Insert image before the name
                item.insertBefore(imgContainer, item.firstChild);
                imgContainer.appendChild(img);
            }
        });
    }

    // Initialize
    loadOrdersFromFirebase();
    loadAnnouncementsOnMenu();
    
    // Add images to menu items based on food type
    initializeMenuItemImages();

    // Search functionality with debounce for better performance
    const debouncedSearch = debounce(function(searchTerm) {
        let hasResults = false;

        menuSections.forEach(section => {
            const items = section.querySelectorAll('.menu-item');
            let sectionHasResults = false;

            items.forEach(item => {
                const itemName = item.querySelector('.item-name').textContent.toLowerCase();
                const itemPrice = item.querySelector('.item-price').textContent.toLowerCase();

                if (itemName.includes(searchTerm) || itemPrice.includes(searchTerm)) {
                    item.style.display = 'flex';
                    sectionHasResults = true;
                    hasResults = true;
                } else {
                    item.style.display = 'none';
                }
            });

            if (searchTerm === '') {
                section.style.display = 'block';
            } else {
                section.style.display = sectionHasResults ? 'block' : 'none';
            }
        });

        showNoResults(!hasResults && searchTerm !== '');
    }, 150); // 150ms debounce delay

    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        debouncedSearch(searchTerm);
    });

    // Category filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            searchInput.value = '';

            menuSections.forEach(section => {
                const sectionCategory = section.getAttribute('data-category');
                const items = section.querySelectorAll('.menu-item');

                items.forEach(item => item.style.display = 'flex');

                if (category === 'all') {
                    section.classList.remove('hidden');
                    section.style.display = 'block';
                } else {
                    if (sectionCategory === category) {
                        section.classList.remove('hidden');
                        section.style.display = 'block';
                    } else {
                        section.classList.add('hidden');
                        section.style.display = 'none';
                    }
                }
            });

            const firstVisibleSection = document.querySelector('.menu-section:not(.hidden)');
            if (firstVisibleSection && category !== 'all') {
                firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Menu item click to open order modal
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const itemName = this.querySelector('.item-name').textContent;
            const itemPrice = this.querySelector('.item-price').textContent;
            
            // Get internet image
            const internetImage = this.getAttribute('data-internet-image') || getInternetImageUrl(itemName);

            selectedItem = {
                name: itemName,
                price: itemPrice,
                image: internetImage
            };

            // Show in order modal
            selectedItemName.textContent = itemName;
            selectedItemPrice.textContent = itemPrice;
            
            // Set image
            const itemImageElement = document.getElementById('selectedItemImage');
            if (itemImageElement) {
                if (internetImage) {
                    itemImageElement.src = internetImage;
                }
            }

            // Open order modal
            orderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Open modal
    function openModal() {
        orderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeOrderModal() {
        orderModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        orderForm.reset();
    }

    // Go to payment from order modal
    function goToPayment() {
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const pickupTime = document.getElementById('pickupTime').value;
        
        if (!customerName || !customerPhone || !pickupTime) {
            showNotification('❌ Please fill in your name, phone, and pickup time first.');
            return;
        }
        
        // Transfer data to payment modal
        document.getElementById('customerNamePayment').value = customerName;
        document.getElementById('customerPhonePayment').value = customerPhone;
        document.getElementById('pickupTimePayment').value = pickupTime;
        document.getElementById('specialInstructionsPayment').value = document.getElementById('specialInstructions').value;
        
        closeOrderModal();
        openPaymentModal();
    }
    
    // Make goToPayment available globally
    window.goToPayment = goToPayment;

    closeModal.addEventListener('click', closeOrderModal);

    orderModal.addEventListener('click', function (e) {
        if (e.target === orderModal) {
            closeOrderModal();
        }
    });

    // ============ PAYMENT MODAL FUNCTIONALITY ============
    
    // Open payment modal
    function openPaymentModal() {
        if (!selectedItem) {
            showNotification('❌ Please select an item first.');
            return;
        }
        
        paymentItemName.textContent = selectedItem.name;
        paymentItemPrice.textContent = selectedItem.price;
        
        // Extract numeric price
        const priceText = selectedItem.price.replace(/[^0-9]/g, '');
        paymentAmount.textContent = priceText || '0';
        
        // Set image
        if (selectedItem.image) {
            if (selectedItem.image.startsWith('http')) {
                paymentItemImage.src = selectedItem.image;
            } else {
                paymentItemImage.src = 'images/' + selectedItem.image;
            }
            paymentItemImage.onerror = function() {
                paymentItemImage.src = getInternetImageUrl(selectedItem.name);
            };
        } else {
            paymentItemImage.src = getInternetImageUrl(selectedItem.name);
        }
        
        paymentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close payment modal
    function closePaymentModalFunc() {
        paymentModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closePaymentModal.addEventListener('click', closePaymentModalFunc);

    paymentModal.addEventListener('click', function (e) {
        if (e.target === paymentModal) {
            closePaymentModalFunc();
        }
    });

    // Handle payment method selection
    const paymentMethodInputs = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', function() {
            selectedPaymentMethod = this.value;
            if (this.value === 'mtn') {
                mtnPaymentSection.style.display = 'block';
            } else {
                mtnPaymentSection.style.display = 'none';
            }
        });
    });

    // Handle payment form submission
    processPaymentBtn.addEventListener('click', async function() {
        const customerName = document.getElementById('customerNamePayment').value.trim();
        const customerPhone = document.getElementById('customerPhonePayment').value.trim();
        const pickupTime = parseInt(document.getElementById('pickupTimePayment').value);
        const specialInstructions = document.getElementById('specialInstructionsPayment').value.trim();
        const mtnPhone = mtnPhoneInput.value.trim();

        if (!customerName || !customerPhone || !pickupTime) {
            showNotification('❌ Please fill in all required fields.');
            return;
        }

        if (!isOrderingTimeAllowed()) {
            showNotification('❌ Sorry! Ordering is not available right now. Please try again during business hours.');
            return;
        }

        // Validate MTN phone if selected
        if (selectedPaymentMethod === 'mtn' && !mtnPhone) {
            showNotification('❌ Please enter your MTN phone number for payment.');
            return;
        }

        // Show loading
        processPaymentBtn.disabled = true;
        processPaymentBtn.textContent = '⏳ Processing...';

        // Extract price
        const priceText = selectedItem.price.replace(/[^0-9]/g, '');
        const amount = parseInt(priceText) || 0;

        if (selectedPaymentMethod === 'mtn') {
            // Process MTN Mobile Money payment
            try {
                await processMTNPayment(customerPhone, mtnPhone, amount, selectedItem.name);
            } catch (error) {
                console.error('MTN Payment error:', error);
                showNotification('⚠️ Payment processing failed. Your order has been saved for pay at pickup.');
                // Still create order even if payment fails
                createOrder(customerName, customerPhone, pickupTime, specialInstructions, 'payment_pending', mtnPhone);
            }
        } else {
            // Pay at pickup - create order directly
            createOrder(customerName, customerPhone, pickupTime, specialInstructions, 'pay_at_pickup', null);
        }

        // Reset button
        processPaymentBtn.disabled = false;
        processPaymentBtn.textContent = '✓ Pay & Confirm Order';
    });

    // MTN Mobile Money Payment Function
    async function processMTNPayment(customerPhone, mtnPhone, amount, itemName) {
        const orderId = Date.now().toString();
        
        // Prepare payment request data
        const paymentData = {
            phoneNumber: mtnPhone,
            amount: amount,
            currency: 'RWF',
            externalId: orderId,
            payerMessage: `Payment for ${itemName} - Biryani House`,
            payeeNote: `Order #${orderId}`
        };

        try {
            // Call the MTN Payment API
            const response = await fetch('/api/mtn/request-pay', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(paymentData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('✅ Payment initiated! Please check your phone to confirm payment.');
                
                // Create the order with pending payment status
                const customerName = document.getElementById('customerNamePayment').value.trim();
                const customerPhoneNum = document.getElementById('customerPhonePayment').value.trim();
                const pickupTime = parseInt(document.getElementById('pickupTimePayment').value);
                const specialInstructions = document.getElementById('specialInstructionsPayment').value.trim();
                
                createOrder(customerName, customerPhoneNum, pickupTime, specialInstructions, 'payment_pending', mtnPhone);
                closePaymentModalFunc();
                
                return result;
            } else {
                showNotification('❌ Payment failed: ' + (result.message || 'Please try again'));
                throw new Error(result.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            // Fallback: If API is not available, simulate success for demo
            showNotification('⚠️ Payment service unavailable. Order saved for pay at pickup.');
            
            const customerName = document.getElementById('customerNamePayment').value.trim();
            const customerPhoneNum = document.getElementById('customerPhonePayment').value.trim();
            const pickupTime = parseInt(document.getElementById('pickupTimePayment').value);
            const specialInstructions = document.getElementById('specialInstructionsPayment').value.trim();
            
            createOrder(customerName, customerPhoneNum, pickupTime, specialInstructions, 'pay_at_pickup', null);
            closePaymentModalFunc();
            
            return { status: 'fallback', message: 'Order saved for pay at pickup' };
        }
    }

    // Create order function
    function createOrder(customerName, customerPhone, pickupTime, specialInstructions, paymentStatus, mtnPhone) {
        const orderId = Date.now().toString();
        const order = {
            id: orderId,
            itemName: selectedItem.name,
            itemPrice: selectedItem.price,
            customerName: customerName,
            customerPhone: customerPhone,
            pickupMinutes: pickupTime,
            specialInstructions: specialInstructions,
            orderTime: new Date().toISOString(),
            endTime: new Date(Date.now() + pickupTime * 60000).toISOString(),
            status: 'active',
            deviceId: currentDeviceId,
            paymentStatus: paymentStatus,
            mtnPhone: mtnPhone
        };

        // Save to Firebase or localStorage
        if (database) {
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), 10000)
                );

                Promise.race([
                    database.ref('orders/' + orderId).set(order),
                    timeoutPromise
                ]).then(() => {
                    closePaymentModalFunc();
                    const paymentMsg = paymentStatus === 'paid_online' ? ' (Paid Online)' : (paymentStatus === 'payment_pending' ? ' (Payment Pending)' : ' (Pay at Pickup)');
                    showNotification(`✅ Order placed successfully! Your ${order.itemName} will be ready in ${pickupTime} minutes.${paymentMsg}`);

                    setTimeout(() => {
                        activeOrdersContainer.style.display = 'block';
                    }, 500);
                }).catch((error) => {
                    console.error('Firebase save failed, trying localStorage:', error);
                    saveToLocalStorage(order);
                });
            } catch (error) {
                console.error('Error saving to Firebase:', error);
                saveToLocalStorage(order);
            }
        } else {
            saveToLocalStorage(order);
        }
    }

    // ============ END PAYMENT MODAL FUNCTIONALITY ============

    // Check if ordering is allowed (6 AM to midnight)
    function isOrderingTimeAllowed() {
        const now = new Date();
        const hour = now.getHours();
        // System accepts orders from 06:00 AM to 00:00 (midnight)
        // 6 AM = hour 6, Midnight = hour 0 (of next day)
        // So allow if: hour >= 6 (6 AM onwards)
        return hour >= 6;
    }

    // Handle order form submission
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const pickupTime = parseInt(document.getElementById('pickupTime').value);
        const specialInstructions = document.getElementById('specialInstructions').value.trim();

        if (!customerName || !customerPhone || !pickupTime) {
            showNotification('❌ Please fill in all required fields.');
            return;
        }

        // Check if ordering is allowed
        if (!isOrderingTimeAllowed()) {
            showNotification('❌ Sorry! Ordering is not available right now. We accept orders from 6:00 AM to 12:00 AM (midnight). Please try again during business hours.');
            return;
        }

        // Create order
        const orderId = Date.now().toString();
        const order = {
            id: orderId,
            itemName: selectedItem.name,
            itemPrice: selectedItem.price,
            customerName: customerName,
            customerPhone: customerPhone,
            pickupMinutes: pickupTime,
            specialInstructions: specialInstructions,
            orderTime: new Date().toISOString(),
            endTime: new Date(Date.now() + pickupTime * 60000).toISOString(),
            status: 'active',
            deviceId: currentDeviceId  // Tag order with this device
        };

        // Save to Firebase or localStorage
        if (database) {
            // Try Firebase first
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), 10000)
                );

                Promise.race([
                    database.ref('orders/' + orderId).set(order),
                    timeoutPromise
                ]).then(() => {
                    closeOrderModal();
                    showNotification(`✅ Order placed successfully! Your ${order.itemName} will be ready in ${pickupTime} minutes.`);

                    // Auto-open orders panel
                    setTimeout(() => {
                        activeOrdersContainer.style.display = 'block';
                    }, 500);
                }).catch((error) => {
                    console.error('Firebase save failed, trying localStorage:', error);
                    saveToLocalStorage(order);
                });
            } catch (error) {
                console.error('Error saving to Firebase:', error);
                saveToLocalStorage(order);
            }
        } else {
            // Firebase not available, save to localStorage
            saveToLocalStorage(order);
        }
    });

    // Save order to localStorage (fallback)
    function saveToLocalStorage(order) {
        try {
            let stored = localStorage.getItem('coffeeOrders');
            let ordersList = stored ? JSON.parse(stored) : [];
            ordersList.push(order);
            localStorage.setItem('coffeeOrders', JSON.stringify(ordersList));

            closeOrderModal();
            showNotification(`✅ Order placed successfully (offline)! Your ${order.itemName} will be ready in ${order.pickupMinutes} minutes.`);

            // Auto-open orders panel and reload
            setTimeout(() => {
                activeOrdersContainer.style.display = 'block';
                loadFromLocalStorage();
            }, 500);
        } catch (error) {
            showNotification('❌ Failed to save order.');
            console.error('Error saving to localStorage:', error);
        }
    }

    // Update orders display
    function updateOrdersDisplay() {
        // Clear intervals
        Object.values(countdownIntervals).forEach(interval => clearInterval(interval));
        countdownIntervals = {};

        // Remove expired orders
        const now = Date.now();
        const ordersToKeep = [];

        orders.forEach(order => {
            const endTime = new Date(order.endTime).getTime();
            if (now - endTime < 3600000) { // Keep for 1 hour after ready
                ordersToKeep.push(order);
            } else {
                // Delete expired orders from Firebase
                if (database) {
                    database.ref('orders/' + order.id).remove();
                }
            }
        });

        orders = ordersToKeep;

        // Update count
        const activeCount = orders.filter(o => o.status === 'active').length;
        orderCount.textContent = activeCount;

        if (activeCount > 0) {
            floatingOrdersBtn.style.display = 'flex';
        } else {
            floatingOrdersBtn.style.display = 'none';
            activeOrdersContainer.style.display = 'none';
        }

        // Render orders
        if (orders.length === 0) {
            activeOrdersContainer.style.display = 'none';
            if (floatingOrdersBtn) floatingOrdersBtn.style.display = 'none';
            return;
        }

        // Show container and button when there are orders
        activeOrdersContainer.style.display = 'block';
        if (floatingOrdersBtn) floatingOrdersBtn.style.display = 'flex';

        activeOrdersList.innerHTML = '';

        orders.forEach((order, index) => {
            const orderCard = createOrderCard(order, index);
            activeOrdersList.appendChild(orderCard);
            startCountdown(order);
        });
    }

    // Create order card
    function createOrderCard(order, index) {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.id = `order-${order.id}`;

        const remainingMs = new Date(order.endTime).getTime() - Date.now();
        const isReady = remainingMs <= 0;

        card.innerHTML = `
            <div class="order-card-header">
                <span class="order-number">Order #${orders.length - index}</span>
            </div>
            <div class="order-item-name">${order.itemName}</div>
            <div class="order-price">${order.itemPrice}</div>
            <div class="order-customer-info">👤 ${order.customerName}</div>
            <div class="order-customer-info">📱 ${order.customerPhone}</div>
            ${order.specialInstructions ? `<div class="order-customer-info">📝 ${order.specialInstructions}</div>` : ''}
            <div class="countdown-display ${isReady ? 'order-ready' : ''}" id="countdown-${order.id}">
                ${isReady ? '✅ ORDER READY FOR PICKUP!' : '<span class="countdown-time">--:--</span><span class="countdown-label">Time remaining</span>'}
            </div>
            <button class="cancel-order-btn" onclick="cancelOrder('${order.id}')">Cancel Order</button>
        `;

        return card;
    }

    // Start countdown for an order
    function startCountdown(order) {
        const countdownElement = document.getElementById(`countdown-${order.id}`);
        if (!countdownElement) return;

        const updateCountdown = () => {
            const now = Date.now();
            const endTime = new Date(order.endTime).getTime();
            const remainingMs = endTime - now;

            if (remainingMs <= 0) {
                countdownElement.innerHTML = '✅ ORDER READY FOR PICKUP!';
                countdownElement.classList.add('order-ready');
                clearInterval(countdownIntervals[order.id]);

                // Update status in Firebase
                if (database) {
                    database.ref('orders/' + order.id + '/status').set('ready');
                }

                showNotification(`🎉 Your ${order.itemName} is ready for pickup!`);
                return;
            }

            const totalSeconds = Math.floor(remainingMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            countdownElement.innerHTML = `
                <span class="countdown-time">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</span>
                <span class="countdown-label">Time remaining</span>
            `;
        };

        updateCountdown();
        countdownIntervals[order.id] = setInterval(updateCountdown, 1000);
    }

    // Cancel order
    window.cancelOrder = function (orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            if (database) {
                // Try Firebase first
                database.ref('orders/' + orderId).remove().then(() => {
                    showNotification('Order cancelled successfully');
                }).catch((error) => {
                    console.error('Firebase delete failed, trying localStorage:', error);
                    cancelOrderLocal(orderId);
                });
            } else {
                // Use localStorage
                cancelOrderLocal(orderId);
            }
        }
    };

    // Cancel order from localStorage
    function cancelOrderLocal(orderId) {
        try {
            let stored = localStorage.getItem('coffeeOrders');
            let ordersList = stored ? JSON.parse(stored) : [];
            ordersList = ordersList.filter(o => o.id !== orderId);
            localStorage.setItem('coffeeOrders', JSON.stringify(ordersList));
            showNotification('Order cancelled successfully');
            loadFromLocalStorage();
        } catch (error) {
            showNotification('❌ Failed to cancel order.');
            console.error('Error cancelling order:', error);
        }
    }

    // Toggle orders panel
    floatingOrdersBtn.addEventListener('click', function () {
        const isVisible = activeOrdersContainer.style.display === 'block';
        activeOrdersContainer.style.display = isVisible ? 'none' : 'block';
    });

    closeOrdersBtn.addEventListener('click', function () {
        activeOrdersContainer.style.display = 'none';
    });

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #5c3d2e, #3e2723);
            color: #ffd89b;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Show no results message
    function showNoResults(show) {
        let noResultsMsg = document.querySelector('.no-results');

        if (show) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results';
                noResultsMsg.textContent = '☕ No items found. Try a different search term.';
                document.querySelector('.menu-content').appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else {
            if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        }
    }

    // Add animations
    const style = document.createElement('style');
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

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    menuSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input'));
            this.blur();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && orderModal.classList.contains('active')) {
            closeOrderModal();
        }
    });

    console.log('🎉 SHAZAM Coffee Shop App with Firebase Loaded!');
    console.log('📱 Mobile responsive | 🔍 Search & filter | 🛒 Order system active | 🌐 Cloud synced');
}

// Contact info modal toggle
function toggleContactInfo(event) {
    if (event) {
        event.preventDefault();
    }
    const modal = document.getElementById('contact-modal');
    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    const modal = document.getElementById('contact-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize menu when script loads (handles both DOMContentLoaded and dynamic loading)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMenu);
} else {
    // DOM already loaded (script loaded dynamically)
    initializeMenu();
}

