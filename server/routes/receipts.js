const express = require('express');
const router = express.Router();
const { getDb, saveDatabase } = require('../database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to generate receipt number
function generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REC-${year}${month}-${random}`;
}

// ============================================================================
// Receipt Routes
// ============================================================================

// Get all receipts
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const { customerId, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT * FROM receipts
            WHERE 1=1
        `;
        const params = [];

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

        const receipts = result[0].values.map(row => ({
            id: row[0],
            receiptNumber: row[1],
            invoiceId: row[2],
            transactionId: row[3],
            customerId: row[4],
            customerName: row[5],
            amount: row[6],
            paymentMethod: row[7],
            issueDate: row[8],
            pdfPath: row[9],
            emailSent: row[10],
            emailSentDate: row[11],
            notes: row[12],
            createdAt: row[13]
        }));

        res.json(receipts);
    } catch (error) {
        console.error('Error fetching receipts:', error);
        res.status(500).json({ error: 'Failed to fetch receipts' });
    }
});

// Get receipt by ID
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        const result = db.exec(`
            SELECT
                r.*,
                pt.paymentDate,
                pt.paymentStatus,
                i.invoiceNumber,
                i.total as invoiceTotal
            FROM receipts r
            JOIN payment_transactions pt ON r.transactionId = pt.id
            LEFT JOIN invoices i ON r.invoiceId = i.id
            WHERE r.id = ?
        `, [id]);

        if (!result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        const row = result[0].values[0];
        const receipt = {
            id: row[0],
            receiptNumber: row[1],
            invoiceId: row[2],
            transactionId: row[3],
            customerId: row[4],
            customerName: row[5],
            amount: row[6],
            paymentMethod: row[7],
            issueDate: row[8],
            pdfPath: row[9],
            emailSent: row[10],
            emailSentDate: row[11],
            notes: row[12],
            createdAt: row[13],
            paymentDate: row[14],
            paymentStatus: row[15],
            invoiceNumber: row[16],
            invoiceTotal: row[17]
        };

        res.json(receipt);
    } catch (error) {
        console.error('Error fetching receipt:', error);
        res.status(500).json({ error: 'Failed to fetch receipt' });
    }
});

// Create receipt (automatically created with payment, but can be manual)
router.post('/', (req, res) => {
    try {
        const db = getDb();
        const {
            invoiceId,
            transactionId,
            customerId,
            customerName,
            amount,
            paymentMethod,
            notes
        } = req.body;

        if (!transactionId || !customerId || !customerName || !amount || !paymentMethod) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const receiptNumber = generateReceiptNumber();
        const issueDate = new Date().toISOString().split('T')[0];

        db.run(`
            INSERT INTO receipts (
                receiptNumber, invoiceId, transactionId, customerId, customerName,
                amount, paymentMethod, issueDate, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [receiptNumber, invoiceId, transactionId, customerId, customerName, amount, paymentMethod, issueDate, notes]);

        saveDatabase();

        res.status(201).json({
            message: 'Receipt created successfully',
            receiptNumber,
            issueDate
        });
    } catch (error) {
        console.error('Error creating receipt:', error);
        res.status(500).json({ error: 'Failed to create receipt' });
    }
});

// Generate PDF receipt
router.get('/:id/pdf', async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        // Get receipt details
        const receiptResult = db.exec(`
            SELECT
                r.*,
                pt.paymentDate,
                i.invoiceNumber,
                i.total as invoiceTotal,
                c.name as companyName,
                c.phone as companyPhone,
                c.email as companyEmail,
                c.address as companyAddress,
                c.logo as companyLogo
            FROM receipts r
            JOIN payment_transactions pt ON r.transactionId = pt.id
            LEFT JOIN invoices i ON r.invoiceId = i.id
            CROSS JOIN company_info c
            WHERE r.id = ?
        `, [id]);

        if (!receiptResult.length || !receiptResult[0].values.length) {
            return res.status(404).json({ error: 'Receipt not found' });
        }

        const row = receiptResult[0].values[0];
        const receipt = {
            receiptNumber: row[1],
            customerName: row[5],
            amount: row[6],
            paymentMethod: row[7],
            issueDate: row[8],
            paymentDate: row[14],
            invoiceNumber: row[15],
            invoiceTotal: row[16],
            companyName: row[17],
            companyPhone: row[18],
            companyEmail: row[19],
            companyAddress: row[20]
        };

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Receipt-${receipt.receiptNumber}.pdf"`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text(receipt.companyName || 'Ketu Kakahala Vehicle Rentals', { align: 'center' });
        doc.fontSize(10).text(receipt.companyAddress || '', { align: 'center' });
        doc.text(`${receipt.companyPhone || ''} | ${receipt.companyEmail || ''}`, { align: 'center' });
        doc.moveDown();

        // Title
        doc.fontSize(24).fillColor('#2e7d32').text('RECEIPT', { align: 'center' });
        doc.moveDown();

        // Receipt details box
        doc.fontSize(10).fillColor('#000');
        const startY = doc.y;

        doc.rect(50, startY, 250, 100).stroke();
        doc.text(`Receipt Number: ${receipt.receiptNumber}`, 60, startY + 10);
        doc.text(`Date: ${receipt.issueDate}`, 60, startY + 30);
        doc.text(`Customer: ${receipt.customerName}`, 60, startY + 50);
        if (receipt.invoiceNumber) {
            doc.text(`Invoice: ${receipt.invoiceNumber}`, 60, startY + 70);
        }

        doc.rect(310, startY, 250, 100).stroke();
        doc.text(`Payment Method: ${receipt.paymentMethod.toUpperCase()}`, 320, startY + 10);
        doc.text(`Payment Date: ${receipt.paymentDate}`, 320, startY + 30);

        doc.moveDown(7);

        // Amount section
        doc.rect(50, doc.y, 510, 80).fill('#f5f5f5').stroke();
        doc.fillColor('#000');
        doc.fontSize(14).text('Amount Paid', 60, doc.y + 20);
        doc.fontSize(28).fillColor('#2e7d32').text(`NAD ${parseFloat(receipt.amount).toFixed(2)}`, 60, doc.y + 15, { width: 490, align: 'right' });

        doc.moveDown(5);

        // Footer
        doc.fontSize(10).fillColor('#666');
        doc.text('Thank you for your business!', { align: 'center' });
        doc.moveDown();
        doc.fontSize(8).text('This is a computer-generated receipt and does not require a signature.', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('Error generating PDF receipt:', error);
        res.status(500).json({ error: 'Failed to generate PDF receipt' });
    }
});

// Get customer's receipts
router.get('/customer/:customerId', (req, res) => {
    try {
        const db = getDb();
        const { customerId } = req.params;

        const result = db.exec(`
            SELECT
                r.*,
                i.invoiceNumber
            FROM receipts r
            LEFT JOIN invoices i ON r.invoiceId = i.id
            WHERE r.customerId = ?
            ORDER BY r.createdAt DESC
        `, [customerId]);

        if (!result.length) {
            return res.json([]);
        }

        const receipts = result[0].values.map(row => ({
            id: row[0],
            receiptNumber: row[1],
            amount: row[6],
            paymentMethod: row[7],
            issueDate: row[8],
            invoiceNumber: row[14]
        }));

        res.json(receipts);
    } catch (error) {
        console.error('Error fetching customer receipts:', error);
        res.status(500).json({ error: 'Failed to fetch customer receipts' });
    }
});

module.exports = router;
