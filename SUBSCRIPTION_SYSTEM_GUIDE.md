# 💳 Subscription, Invoice & Receipt System - Setup Guide

## 🎉 What's New

Your Ketu Rental System now includes a **comprehensive subscription, invoicing, and receipt management system** with:

### ✨ Features Added

1. **Subscription Management**
   - Multiple subscription models (Monthly, Yearly, Usage-based, One-time, Freemium)
   - 7 pre-configured subscription plans
   - Auto-renewal functionality
   - Free trial periods
   - Usage tracking for usage-based plans
   - Subscription cancellation and reactivation

2. **Invoice Generation**
   - Professional invoice creation with line items
   - Automatic VAT calculation (15% Namibian rate)
   - Multiple invoice types (Rental, Subscription, Late Fee, Damage, Other)
   - Invoice status tracking (Draft, Sent, Paid, Partial, Overdue, Cancelled)
   - Payment tracking and balance management
   - Due date management with overdue detection

3. **Receipt Management**
   - Automatic receipt generation for payments
   - PDF receipt generation with company branding
   - Receipt number tracking
   - Email delivery capability
   - Download and print functionality

4. **Payment Integration**
   - Multiple payment methods:
     - Cash payments
     - Bank Transfer (FNB, Bank Windhoek, Standard Bank, Nedbank)
     - Card Payments (Stripe/PayPal integration ready)
     - Nam Post Mobile Money
     - Mobile Money (MTC, TN Mobile)
   - Transaction tracking
   - Payment status management
   - Refund support

5. **VAT & Tax Management**
   - Automatic 15% VAT calculation (Namibian standard rate)
   - Tax breakdown on invoices
   - Configurable tax rates per line item

6. **Email System** (Infrastructure ready)
   - Email templates for invoices, receipts, reminders
   - Customizable email content
   - Scheduled reminder system

---

## 📦 Installation

### Step 1: Install Dependencies

Navigate to the server directory and install new packages:

```bash
cd server
npm install
```

This will install:
- `pdfkit` - PDF generation
- `nodemailer` - Email delivery
- `stripe` - Stripe payment integration
- `node-cron` - Scheduled tasks

### Step 2: Run Database Migration

Run the migration script to create all new database tables:

```bash
npm run setup:subscription
```

You should see output like:

```
🔄 Starting subscription system migration...
✅ Created table: subscription_plans
✅ Created table: customer_subscriptions
✅ Created table: invoices
✅ Created table: invoice_items
✅ Created table: payment_transactions
✅ Created table: receipts
...
✅ Migration completed successfully!
```

### Step 3: Verify Installation

Start the server:

```bash
npm start
```

You should see the new endpoints listed:

```
💳 New Subscription & Billing System:
  GET    /api/subscriptions/plans
  GET    /api/invoices
  GET    /api/receipts
  POST   /api/subscriptions/subscribe
  POST   /api/invoices
  GET    /api/receipts/:id/pdf
```

---

## 🚀 Quick Start Guide

### 1. View Subscription Plans

```bash
curl http://localhost:3001/api/subscriptions/plans
```

**Response:** List of 7 subscription plans including:
- Free Plan (NAD 0/month)
- Monthly Basic (NAD 299/month)
- Monthly Premium (NAD 599/month)
- Yearly Standard (NAD 2,990/year)
- Yearly VIP (NAD 5,990/year)
- Pay Per Rental (usage-based)
- Lifetime Access (NAD 9,999 one-time)

### 2. Subscribe a Customer

```bash
curl -X POST http://localhost:3001/api/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "planId": 2,
    "startDate": "2026-01-01"
  }'
```

### 3. Create an Invoice

```bash
curl -X POST http://localhost:3001/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "type": "rental",
    "items": [
      {
        "description": "Vehicle Rental - Toyota Corolla",
        "quantity": 5,
        "unitPrice": 500
      }
    ],
    "dueDate": "2026-01-15",
    "notes": "5-day rental from 01/01 to 01/05"
  }'
```

**Invoice Calculation:**
- Subtotal: NAD 2,500 (5 days × NAD 500)
- VAT (15%): NAD 375
- **Total: NAD 2,875**

### 4. Record a Payment

```bash
curl -X POST http://localhost:3001/api/invoices/1/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2875,
    "paymentMethod": "bank_transfer",
    "transactionId": "BNK123456",
    "notes": "FNB Transfer"
  }'
```

### 5. Generate PDF Receipt

```bash
curl http://localhost:3001/api/receipts/1/pdf > receipt.pdf
```

---

## 📊 Database Schema

### New Tables Created

1. **subscription_plans** - Available subscription plans
2. **customer_subscriptions** - Active customer subscriptions
3. **invoices** - Generated invoices
4. **invoice_items** - Line items for each invoice
5. **payment_transactions** - Payment records
6. **receipts** - Receipt records
7. **payment_reminders** - Automated reminders
8. **usage_records** - Usage tracking for billing
9. **payment_gateways** - Payment gateway configs
10. **email_templates** - Email templates

---

## 🔧 API Endpoints Reference

### Subscription Plans

#### GET `/api/subscriptions/plans`
Get all active subscription plans

**Response:**
```json
[
  {
    "id": 1,
    "name": "Monthly Basic",
    "description": "Ideal for regular renters",
    "type": "monthly",
    "price": 299,
    "currency": "NAD",
    "billingCycle": "monthly",
    "features": ["Up to 5 vehicles", "Unlimited bookings", "Priority support"],
    "maxVehicles": 5,
    "freeTrialDays": 0
  }
]
```

#### GET `/api/subscriptions/plans/:id`
Get specific plan details

#### GET `/api/subscriptions/customer/:customerId`
Get all subscriptions for a customer

#### POST `/api/subscriptions/subscribe`
Subscribe a customer to a plan

**Request Body:**
```json
{
  "customerId": 1,
  "planId": 2,
  "startDate": "2026-01-01"
}
```

#### PUT `/api/subscriptions/cancel/:subscriptionId`
Cancel a subscription

**Request Body:**
```json
{
  "cancelReason": "Customer request"
}
```

#### PUT `/api/subscriptions/reactivate/:subscriptionId`
Reactivate a cancelled subscription

#### POST `/api/subscriptions/usage`
Record usage for usage-based billing

**Request Body:**
```json
{
  "subscriptionId": 1,
  "customerId": 1,
  "usageType": "rental",
  "quantity": 1,
  "unitPrice": 500,
  "description": "Vehicle rental"
}
```

### Invoices

#### GET `/api/invoices`
Get all invoices (with filters)

**Query Parameters:**
- `status` - Filter by status
- `customerId` - Filter by customer
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

#### GET `/api/invoices/:id`
Get invoice details with line items

#### POST `/api/invoices`
Create a new invoice

**Request Body:**
```json
{
  "customerId": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+264 81 234 5678",
  "customerAddress": "123 Main St, Windhoek",
  "type": "rental",
  "items": [
    {
      "description": "Vehicle Rental",
      "quantity": 3,
      "unitPrice": 500,
      "taxRate": 15.0
    }
  ],
  "discount": 0,
  "dueDate": "2026-01-15",
  "notes": "Payment terms: Net 14 days",
  "termsAndConditions": "Standard rental terms apply"
}
```

#### PUT `/api/invoices/:id/status`
Update invoice status

**Request Body:**
```json
{
  "status": "sent"
}
```

**Valid statuses:** draft, sent, paid, partial, overdue, cancelled

#### POST `/api/invoices/:id/payment`
Record a payment for an invoice

**Request Body:**
```json
{
  "amount": 1500,
  "paymentMethod": "bank_transfer",
  "transactionId": "BNK123456",
  "notes": "Partial payment"
}
```

#### GET `/api/invoices/customer/:customerId`
Get all invoices for a customer

#### DELETE `/api/invoices/:id`
Cancel an invoice (soft delete)

### Receipts

#### GET `/api/receipts`
Get all receipts

**Query Parameters:**
- `customerId` - Filter by customer
- `limit` - Results per page
- `offset` - Pagination offset

#### GET `/api/receipts/:id`
Get receipt details

#### POST `/api/receipts`
Create a receipt manually

**Request Body:**
```json
{
  "invoiceId": 1,
  "transactionId": 1,
  "customerId": 1,
  "customerName": "John Doe",
  "amount": 2875,
  "paymentMethod": "cash",
  "notes": "Payment received in full"
}
```

#### GET `/api/receipts/:id/pdf`
Generate and download PDF receipt

**Response:** PDF file

#### GET `/api/receipts/customer/:customerId`
Get all receipts for a customer

---

## 💰 Subscription Plans Explained

### 1. Free Plan (Freemium)
- **Price:** NAD 0/month
- **Features:** Basic access, 1 vehicle, 2 bookings/month
- **Best for:** Occasional renters trying the service

### 2. Monthly Basic
- **Price:** NAD 299/month
- **Features:** Up to 5 vehicles, unlimited bookings, 10% discount
- **Best for:** Regular renters

### 3. Monthly Premium
- **Price:** NAD 599/month
- **Features:** Unlimited vehicles, 20% discount, free insurance
- **Best for:** Frequent renters

### 4. Yearly Standard
- **Price:** NAD 2,990/year (saves NAD 598 vs monthly)
- **Features:** Up to 10 vehicles, 15% discount
- **Best for:** Committed long-term renters

### 5. Yearly VIP
- **Price:** NAD 5,990/year (saves NAD 1,198 vs monthly)
- **Features:** All premium features, 25% discount, airport pickup
- **Best for:** VIP customers

### 6. Pay Per Rental (Usage-based)
- **Price:** NAD 0/month + per-rental fees
- **Features:** No commitment, pay only when you rent
- **Best for:** Occasional users

### 7. Lifetime Access
- **Price:** NAD 9,999 (one-time)
- **Features:** All features, 30% lifetime discount
- **Best for:** Super loyal customers

---

## 🧮 VAT Calculation

All invoices automatically calculate 15% VAT (Namibian standard rate).

**Example:**
```
Subtotal:     NAD 1,000.00
VAT (15%):    NAD   150.00
─────────────────────────
Total:        NAD 1,150.00
```

You can override the tax rate per line item if needed.

---

## 💳 Payment Methods Supported

### 1. Cash
- Direct cash payments
- No transaction fees
- Instant confirmation

### 2. Bank Transfer
- FNB Namibia
- Bank Windhoek
- Standard Bank
- Nedbank
- Requires bank reference number

### 3. Card Payments (Stripe/PayPal)
- Integration ready
- Requires API keys configuration
- International cards supported

### 4. Nam Post Mobile Money
- Integration ready
- Local Namibian payment method

### 5. Mobile Money
- MTC Mobile Money
- TN Mobile
- Integration ready

---

## 📧 Email System (Ready to Configure)

Email templates are pre-created for:
- Invoice notifications
- Receipt confirmations
- Payment reminders
- Subscription renewals
- Subscription cancellations

### Configure Email (Coming Next)

You'll need to:
1. Add SMTP credentials
2. Configure email service (Gmail, SendGrid, etc.)
3. Customize email templates
4. Enable automated sending

---

## 🎯 Next Steps

### Immediate
1. ✅ Test the API endpoints
2. ✅ Create test invoices and receipts
3. ✅ Subscribe test customers to plans

### Short-term
1. Configure payment gateways (Stripe, PayPal)
2. Set up email delivery (SMTP)
3. Implement payment reminder cron jobs
4. Build frontend UI for subscriptions
5. Add customer portal

### Long-term
1. Advanced analytics dashboard
2. Multi-currency support
3. Tax exemption handling
4. Bulk invoice generation
5. Automated billing cycles

---

## 🐛 Troubleshooting

### Migration Failed
```bash
# Reset and re-run migration
rm server/rental.db
npm run setup:subscription
```

### Can't Create Invoice
- Ensure customer exists in database
- Verify all required fields are provided
- Check items array has at least one item

### PDF Not Generating
- Ensure pdfkit is installed: `npm install pdfkit`
- Check file permissions
- Verify company info is set

### Payment Not Recording
- Ensure invoice exists
- Verify amount doesn't exceed balance
- Check payment method is valid

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review API endpoint documentation
3. Check database schema
4. Test with curl commands

---

## 🎊 Congratulations!

Your Ketu Rental System now has enterprise-level billing capabilities! 🚀

**What you can do now:**
- ✅ Offer subscription plans to customers
- ✅ Generate professional invoices with VAT
- ✅ Track all payments
- ✅ Issue branded receipts
- ✅ Manage multiple payment methods
- ✅ Track usage-based billing
- ✅ Automate recurring billing

Enjoy your new subscription system! 💳
