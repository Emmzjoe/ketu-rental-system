-- ============================================================================
-- Ketu Rental System - Subscription, Invoice & Receipt System
-- Migration Script
-- ============================================================================

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('monthly', 'yearly', 'usage_based', 'one_time', 'freemium')),
    price REAL NOT NULL,
    currency TEXT DEFAULT 'NAD',
    billingCycle TEXT CHECK(billingCycle IN ('monthly', 'yearly', 'one_time', 'usage')),
    features TEXT, -- JSON string of features
    maxVehicles INTEGER,
    maxBookings INTEGER,
    maxUsers INTEGER,
    usageRate REAL, -- For usage-based billing (e.g., price per rental)
    freeTrialDays INTEGER DEFAULT 0,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer Subscriptions Table
CREATE TABLE IF NOT EXISTS customer_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER NOT NULL,
    planId INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'cancelled', 'expired', 'suspended', 'trial')),
    startDate DATE NOT NULL,
    endDate DATE,
    trialEndDate DATE,
    autoRenew BOOLEAN DEFAULT 1,
    nextBillingDate DATE,
    currentPeriodStart DATE,
    currentPeriodEnd DATE,
    cancelledAt DATETIME,
    cancelReason TEXT,
    usageCount INTEGER DEFAULT 0, -- For usage-based tracking
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (planId) REFERENCES subscription_plans(id)
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceNumber TEXT UNIQUE NOT NULL,
    customerId INTEGER NOT NULL,
    customerName TEXT NOT NULL,
    customerEmail TEXT,
    customerPhone TEXT,
    customerAddress TEXT,
    subscriptionId INTEGER,
    bookingId INTEGER,
    type TEXT NOT NULL CHECK(type IN ('rental', 'subscription', 'late_fee', 'damage', 'other')),
    subtotal REAL NOT NULL,
    taxRate REAL DEFAULT 15.0, -- VAT rate (15% in Namibia)
    taxAmount REAL NOT NULL,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    amountPaid REAL DEFAULT 0,
    balance REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
    dueDate DATE NOT NULL,
    issueDate DATE NOT NULL,
    paidDate DATE,
    notes TEXT,
    termsAndConditions TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (subscriptionId) REFERENCES customer_subscriptions(id),
    FOREIGN KEY (bookingId) REFERENCES bookings(id)
);

-- Invoice Line Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceId INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unitPrice REAL NOT NULL,
    taxRate REAL DEFAULT 15.0,
    taxAmount REAL NOT NULL,
    amount REAL NOT NULL, -- quantity * unitPrice + taxAmount
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Payment Transactions Table (Enhanced)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceId INTEGER,
    receiptNumber TEXT UNIQUE NOT NULL,
    customerId INTEGER NOT NULL,
    customerName TEXT NOT NULL,
    amount REAL NOT NULL,
    paymentMethod TEXT NOT NULL CHECK(paymentMethod IN ('cash', 'bank_transfer', 'mobile_money', 'card', 'nam_post', 'stripe', 'paypal')),
    paymentStatus TEXT NOT NULL CHECK(paymentStatus IN ('pending', 'completed', 'failed', 'refunded')),
    transactionId TEXT, -- External transaction ID (e.g., from Stripe, PayPal)
    bankReference TEXT, -- For bank transfers
    mobileReference TEXT, -- For mobile money
    cardLast4 TEXT, -- For card payments
    paymentDate DATE NOT NULL,
    notes TEXT,
    processedBy INTEGER, -- User ID who processed the payment
    refundedAmount REAL DEFAULT 0,
    refundedDate DATE,
    refundReason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id),
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiptNumber TEXT UNIQUE NOT NULL,
    invoiceId INTEGER,
    transactionId INTEGER NOT NULL,
    customerId INTEGER NOT NULL,
    customerName TEXT NOT NULL,
    amount REAL NOT NULL,
    paymentMethod TEXT NOT NULL,
    issueDate DATE NOT NULL,
    pdfPath TEXT, -- Path to generated PDF
    emailSent BOOLEAN DEFAULT 0,
    emailSentDate DATETIME,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id),
    FOREIGN KEY (transactionId) REFERENCES payment_transactions(id),
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Payment Reminders Table
CREATE TABLE IF NOT EXISTS payment_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceId INTEGER NOT NULL,
    customerId INTEGER NOT NULL,
    customerEmail TEXT,
    customerPhone TEXT,
    reminderType TEXT NOT NULL CHECK(reminderType IN ('email', 'sms', 'both')),
    status TEXT NOT NULL CHECK(status IN ('pending', 'sent', 'failed')),
    sentDate DATETIME,
    daysOverdue INTEGER,
    message TEXT,
    errorMessage TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id),
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Usage Tracking Table (for usage-based billing)
CREATE TABLE IF NOT EXISTS usage_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscriptionId INTEGER NOT NULL,
    customerId INTEGER NOT NULL,
    usageType TEXT NOT NULL CHECK(usageType IN ('rental', 'extra_km', 'late_return', 'addon')),
    quantity INTEGER DEFAULT 1,
    unitPrice REAL NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    recordDate DATE NOT NULL,
    invoiceId INTEGER, -- Linked invoice when billed
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriptionId) REFERENCES customer_subscriptions(id),
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (invoiceId) REFERENCES invoices(id)
);

-- Payment Gateway Configurations Table
CREATE TABLE IF NOT EXISTS payment_gateways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gateway TEXT NOT NULL UNIQUE CHECK(gateway IN ('stripe', 'paypal', 'nam_post', 'bank_transfer')),
    isEnabled BOOLEAN DEFAULT 0,
    apiKey TEXT,
    apiSecret TEXT,
    webhookSecret TEXT,
    accountNumber TEXT, -- For bank transfer
    accountName TEXT,
    bankName TEXT,
    configuration TEXT, -- JSON string for additional configs
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    templateType TEXT NOT NULL UNIQUE CHECK(templateType IN ('invoice', 'receipt', 'reminder', 'subscription_created', 'subscription_renewed', 'subscription_cancelled', 'payment_received')),
    subject TEXT NOT NULL,
    htmlBody TEXT NOT NULL,
    textBody TEXT,
    variables TEXT, -- JSON string of available variables
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Insert Default Data
-- ============================================================================

-- Default Subscription Plans
INSERT INTO subscription_plans (name, description, type, price, billingCycle, features, maxVehicles, maxBookings, isActive) VALUES
('Free Plan', 'Basic features for occasional renters', 'freemium', 0, 'monthly', '["View vehicles", "Make bookings", "Basic support"]', 1, 2, 1),
('Monthly Basic', 'Ideal for regular renters', 'monthly', 299, 'monthly', '["Up to 5 vehicles", "Unlimited bookings", "Priority support", "10% discount"]', 5, NULL, 1),
('Monthly Premium', 'Best for frequent renters', 'monthly', 599, 'monthly', '["Unlimited vehicles", "Unlimited bookings", "24/7 support", "20% discount", "Free insurance"]', NULL, NULL, 1),
('Yearly Standard', 'Annual subscription with savings', 'yearly', 2990, 'yearly', '["Up to 10 vehicles", "Unlimited bookings", "Priority support", "15% discount"]', 10, NULL, 1),
('Yearly VIP', 'Best value annual plan', 'yearly', 5990, 'yearly', '["Unlimited vehicles", "Unlimited bookings", "24/7 VIP support", "25% discount", "Free insurance", "Airport pickup"]', NULL, NULL, 1),
('Pay Per Rental', 'No commitment, pay as you go', 'usage_based', 0, 'usage', '["Pay per rental", "No monthly fees", "Standard support"]', NULL, NULL, 1),
('Lifetime Access', 'One-time payment for lifetime access', 'one_time', 9999, 'one_time', '["Unlimited vehicles", "Unlimited bookings", "Lifetime support", "30% discount", "All premium features"]', NULL, NULL, 1);

-- Default Payment Gateway Configurations
INSERT INTO payment_gateways (gateway, isEnabled, bankName, accountName) VALUES
('bank_transfer', 1, 'FNB Namibia', 'Ketu Kakahala Vehicle Rentals'),
('nam_post', 0, NULL, NULL),
('stripe', 0, NULL, NULL),
('paypal', 0, NULL, NULL);

-- Default Email Templates
INSERT INTO email_templates (templateType, subject, htmlBody, textBody, variables) VALUES
('invoice', 'Invoice #{invoiceNumber} from Ketu Kakahala Vehicle Rentals',
'<h2>Invoice #{invoiceNumber}</h2><p>Dear {customerName},</p><p>Please find your invoice attached.</p><p>Amount Due: {total}</p><p>Due Date: {dueDate}</p>',
'Invoice #{invoiceNumber}\n\nDear {customerName},\n\nAmount Due: {total}\nDue Date: {dueDate}',
'["invoiceNumber", "customerName", "total", "dueDate"]'),

('receipt', 'Payment Receipt #{receiptNumber} - Ketu Kakahala Vehicle Rentals',
'<h2>Payment Receipt</h2><p>Dear {customerName},</p><p>Thank you for your payment of {amount}.</p><p>Receipt Number: {receiptNumber}</p>',
'Payment Receipt #{receiptNumber}\n\nThank you for your payment of {amount}.',
'["receiptNumber", "customerName", "amount"]'),

('reminder', 'Payment Reminder - Invoice #{invoiceNumber}',
'<h2>Payment Reminder</h2><p>Dear {customerName},</p><p>This is a friendly reminder that invoice #{invoiceNumber} for {amount} is now {daysOverdue} days overdue.</p>',
'Payment Reminder\n\nInvoice #{invoiceNumber} for {amount} is {daysOverdue} days overdue.',
'["invoiceNumber", "customerName", "amount", "daysOverdue"]');

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customerId);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_duedate ON invoices(dueDate);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON customer_subscriptions(customerId);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON payment_transactions(invoiceId);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON payment_transactions(customerId);
CREATE INDEX IF NOT EXISTS idx_receipts_invoice ON receipts(invoiceId);
CREATE INDEX IF NOT EXISTS idx_usage_subscription ON usage_records(subscriptionId);

-- ============================================================================
-- End of Migration
-- ============================================================================
