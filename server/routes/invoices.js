const express = require('express');
const router = express.Router();
const { getDb, saveDatabase } = require('../database');

// Helper function to generate invoice number
function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
}

// Helper function to calculate VAT (15% in Namibia)
function calculateVAT(amount, taxRate = 15.0) {
    const vatAmount = (amount * taxRate) / 100;
    return {
        subtotal: amount,
        taxRate,
        vatAmount: parseFloat(vatAmount.toFixed(2)),
        total: parseFloat((amount + vatAmount).toFixed(2))
    };
}

// ============================================================================
// Invoice Routes
// ============================================================================

// Get all invoices
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const { status, customerId, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT * FROM invoices
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        if (customerId) {
            query += ` AND customerId = ?`;
            params.push(customerId);
        }

        query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const result = db.exec(query, params);

        if (!result.length) {
            return res.json([]);
        }

        const invoices = result[0].values.map(row => ({
            id: row[0],
            invoiceNumber: row[1],
            customerId: row[2],
            customerName: row[3],
            customerEmail: row[4],
            customerPhone: row[5],
            customerAddress: row[6],
            subscriptionId: row[7],
            bookingId: row[8],
            type: row[9],
            subtotal: row[10],
            taxRate: row[11],
            taxAmount: row[12],
            discount: row[13],
            total: row[14],
            amountPaid: row[15],
            balance: row[16],
            status: row[17],
            dueDate: row[18],
            issueDate: row[19],
            paidDate: row[20],
            notes: row[21],
            termsAndConditions: row[22],
            createdAt: row[23],
            updatedAt: row[24]
        }));

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// Get invoice by ID with line items
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        // Get invoice
        const invoiceResult = db.exec(`SELECT * FROM invoices WHERE id = ?`, [id]);

        if (!invoiceResult.length || !invoiceResult[0].values.length) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const row = invoiceResult[0].values[0];
        const invoice = {
            id: row[0],
            invoiceNumber: row[1],
            customerId: row[2],
            customerName: row[3],
            customerEmail: row[4],
            customerPhone: row[5],
            customerAddress: row[6],
            subscriptionId: row[7],
            bookingId: row[8],
            type: row[9],
            subtotal: row[10],
            taxRate: row[11],
            taxAmount: row[12],
            discount: row[13],
            total: row[14],
            amountPaid: row[15],
            balance: row[16],
            status: row[17],
            dueDate: row[18],
            issueDate: row[19],
            paidDate: row[20],
            notes: row[21],
            termsAndConditions: row[22],
            createdAt: row[23],
            updatedAt: row[24]
        };

        // Get line items
        const itemsResult = db.exec(`SELECT * FROM invoice_items WHERE invoiceId = ?`, [id]);

        invoice.items = [];
        if (itemsResult.length && itemsResult[0].values.length) {
            invoice.items = itemsResult[0].values.map(itemRow => ({
                id: itemRow[0],
                invoiceId: itemRow[1],
                description: itemRow[2],
                quantity: itemRow[3],
                unitPrice: itemRow[4],
                taxRate: itemRow[5],
                taxAmount: itemRow[6],
                amount: itemRow[7],
                createdAt: itemRow[8]
            }));
        }

        res.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});

// Create invoice
router.post('/', (req, res) => {
    try {
        const db = getDb();
        const {
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            subscriptionId,
            bookingId,
            type,
            items,
            discount = 0,
            dueDate,
            notes,
            termsAndConditions
        } = req.body;

        // Validate required fields
        if (!customerId || !customerName || !type || !items || items.length === 0) {
            return res.status(400).json({
                error: 'Missing required fields: customerId, customerName, type, and items are required'
            });
        }

        // Calculate totals
        let subtotal = 0;
        let totalTax = 0;

        items.forEach(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const taxAmount = (itemSubtotal * (item.taxRate || 15.0)) / 100;
            subtotal += itemSubtotal;
            totalTax += taxAmount;
        });

        const total = subtotal + totalTax - discount;
        const balance = total;

        const invoiceNumber = generateInvoiceNumber();
        const issueDate = new Date().toISOString().split('T')[0];
        const invoiceDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Insert invoice
        db.run(`
            INSERT INTO invoices (
                invoiceNumber, customerId, customerName, customerEmail, customerPhone, customerAddress,
                subscriptionId, bookingId, type, subtotal, taxRate, taxAmount, discount, total,
                amountPaid, balance, status, dueDate, issueDate, notes, termsAndConditions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 15.0, ?, ?, ?, 0, ?, 'draft', ?, ?, ?, ?)
        `, [
            invoiceNumber, customerId, customerName, customerEmail, customerPhone, customerAddress,
            subscriptionId, bookingId, type, subtotal, totalTax, discount, total, balance,
            invoiceDueDate, issueDate, notes, termsAndConditions
        ]);

        // Get the invoice ID
        const invoiceResult = db.exec(`
            SELECT id FROM invoices WHERE invoiceNumber = ?
        `, [invoiceNumber]);

        const invoiceId = invoiceResult[0].values[0][0];

        // Insert line items
        items.forEach(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const taxRate = item.taxRate || 15.0;
            const taxAmount = (itemSubtotal * taxRate) / 100;
            const amount = itemSubtotal + taxAmount;

            db.run(`
                INSERT INTO invoice_items (
                    invoiceId, description, quantity, unitPrice, taxRate, taxAmount, amount
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [invoiceId, item.description, item.quantity, item.unitPrice, taxRate, taxAmount, amount]);
        });

        saveDatabase();

        res.status(201).json({
            message: 'Invoice created successfully',
            invoiceId,
            invoiceNumber,
            total,
            balance
        });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// Update invoice status
router.put('/:id/status', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        db.run(`
            UPDATE invoices
            SET status = ?, updatedAt = datetime('now')
            WHERE id = ?
        `, [status, id]);

        saveDatabase();

        res.json({ message: 'Invoice status updated successfully' });
    } catch (error) {
        console.error('Error updating invoice status:', error);
        res.status(500).json({ error: 'Failed to update invoice status' });
    }
});

// Record payment for invoice
router.post('/:id/payment', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { amount, paymentMethod, transactionId, notes } = req.body;

        if (!amount || !paymentMethod) {
            return res.status(400).json({ error: 'Amount and payment method are required' });
        }

        // Get invoice
        const invoiceResult = db.exec(`SELECT * FROM invoices WHERE id = ?`, [id]);

        if (!invoiceResult.length || !invoiceResult[0].values.length) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = invoiceResult[0].values[0];
        const currentBalance = invoice[16]; // balance
        const currentPaid = invoice[15]; // amountPaid

        const newAmountPaid = parseFloat(currentPaid) + parseFloat(amount);
        const newBalance = parseFloat(currentBalance) - parseFloat(amount);

        // Determine new status
        let newStatus = 'partial';
        if (newBalance <= 0) {
            newStatus = 'paid';
        }

        // Update invoice
        db.run(`
            UPDATE invoices
            SET amountPaid = ?,
                balance = ?,
                status = ?,
                paidDate = CASE WHEN ? <= 0 THEN date('now') ELSE paidDate END,
                updatedAt = datetime('now')
            WHERE id = ?
        `, [newAmountPaid, Math.max(0, newBalance), newStatus, newBalance, id]);

        // Create payment transaction
        const receiptNumber = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const paymentDate = new Date().toISOString().split('T')[0];

        db.run(`
            INSERT INTO payment_transactions (
                invoiceId, receiptNumber, customerId, customerName, amount,
                paymentMethod, paymentStatus, transactionId, paymentDate, notes
            ) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
        `, [id, receiptNumber, invoice[2], invoice[3], amount, paymentMethod, transactionId, paymentDate, notes]);

        saveDatabase();

        res.json({
            message: 'Payment recorded successfully',
            receiptNumber,
            newBalance: Math.max(0, newBalance),
            status: newStatus
        });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
});

// Get customer's invoices
router.get('/customer/:customerId', (req, res) => {
    try {
        const db = getDb();
        const { customerId } = req.params;

        const result = db.exec(`
            SELECT * FROM invoices
            WHERE customerId = ?
            ORDER BY createdAt DESC
        `, [customerId]);

        if (!result.length) {
            return res.json([]);
        }

        const invoices = result[0].values.map(row => ({
            id: row[0],
            invoiceNumber: row[1],
            type: row[9],
            subtotal: row[10],
            taxAmount: row[12],
            total: row[14],
            amountPaid: row[15],
            balance: row[16],
            status: row[17],
            dueDate: row[18],
            issueDate: row[19],
            paidDate: row[20]
        }));

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching customer invoices:', error);
        res.status(500).json({ error: 'Failed to fetch customer invoices' });
    }
});

// Delete invoice (soft delete by marking as cancelled)
router.delete('/:id', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        db.run(`
            UPDATE invoices
            SET status = 'cancelled', updatedAt = datetime('now')
            WHERE id = ?
        `, [id]);

        saveDatabase();

        res.json({ message: 'Invoice cancelled successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
});

module.exports = router;
