const express = require('express');
const router = express.Router();
const { getDb, saveDatabase } = require('../database');

// ============================================================================
// Subscription Plans Routes
// ============================================================================

// Get all subscription plans
router.get('/plans', (req, res) => {
    try {
        const db = getDb();
        const result = db.exec(`
            SELECT * FROM subscription_plans
            WHERE isActive = 1
            ORDER BY price ASC
        `);

        if (!result.length) {
            return res.json([]);
        }

        const plans = result[0].values.map(row => ({
            id: row[0],
            name: row[1],
            description: row[2],
            type: row[3],
            price: row[4],
            currency: row[5],
            billingCycle: row[6],
            features: JSON.parse(row[7] || '[]'),
            maxVehicles: row[8],
            maxBookings: row[9],
            maxUsers: row[10],
            usageRate: row[11],
            freeTrialDays: row[12],
            isActive: row[13],
            createdAt: row[14],
            updatedAt: row[15]
        }));

        res.json(plans);
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
});

// Get plan by ID
router.get('/plans/:id', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        const result = db.exec(`
            SELECT * FROM subscription_plans WHERE id = ?
        `, [id]);

        if (!result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const row = result[0].values[0];
        const plan = {
            id: row[0],
            name: row[1],
            description: row[2],
            type: row[3],
            price: row[4],
            currency: row[5],
            billingCycle: row[6],
            features: JSON.parse(row[7] || '[]'),
            maxVehicles: row[8],
            maxBookings: row[9],
            maxUsers: row[10],
            usageRate: row[11],
            freeTrialDays: row[12],
            isActive: row[13],
            createdAt: row[14],
            updatedAt: row[15]
        };

        res.json(plan);
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ error: 'Failed to fetch plan' });
    }
});

// ============================================================================
// Customer Subscriptions Routes
// ============================================================================

// Get customer's subscriptions
router.get('/customer/:customerId', (req, res) => {
    try {
        const db = getDb();
        const { customerId } = req.params;

        const result = db.exec(`
            SELECT
                cs.*,
                sp.name as planName,
                sp.type as planType,
                sp.price as planPrice,
                sp.billingCycle
            FROM customer_subscriptions cs
            JOIN subscription_plans sp ON cs.planId = sp.id
            WHERE cs.customerId = ?
            ORDER BY cs.createdAt DESC
        `, [customerId]);

        if (!result.length) {
            return res.json([]);
        }

        const subscriptions = result[0].values.map(row => ({
            id: row[0],
            customerId: row[1],
            planId: row[2],
            status: row[3],
            startDate: row[4],
            endDate: row[5],
            trialEndDate: row[6],
            autoRenew: row[7],
            nextBillingDate: row[8],
            currentPeriodStart: row[9],
            currentPeriodEnd: row[10],
            cancelledAt: row[11],
            cancelReason: row[12],
            usageCount: row[13],
            createdAt: row[14],
            updatedAt: row[15],
            planName: row[16],
            planType: row[17],
            planPrice: row[18],
            billingCycle: row[19]
        }));

        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching customer subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Create new subscription
router.post('/subscribe', (req, res) => {
    try {
        const db = getDb();
        const { customerId, planId, startDate } = req.body;

        // Validate required fields
        if (!customerId || !planId) {
            return res.status(400).json({ error: 'Customer ID and Plan ID are required' });
        }

        // Get plan details
        const planResult = db.exec(`SELECT * FROM subscription_plans WHERE id = ?`, [planId]);
        if (!planResult.length || !planResult[0].values.length) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const plan = planResult[0].values[0];
        const freeTrialDays = plan[12];
        const billingCycle = plan[6];

        // Calculate dates
        const start = startDate || new Date().toISOString().split('T')[0];
        const trialEnd = freeTrialDays > 0
            ? new Date(Date.now() + freeTrialDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : null;

        let endDate, nextBillingDate;
        if (billingCycle === 'monthly') {
            endDate = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1)).toISOString().split('T')[0];
            nextBillingDate = endDate;
        } else if (billingCycle === 'yearly') {
            endDate = new Date(new Date(start).setFullYear(new Date(start).getFullYear() + 1)).toISOString().split('T')[0];
            nextBillingDate = endDate;
        } else if (billingCycle === 'one_time') {
            endDate = null; // Lifetime
            nextBillingDate = null;
        }

        const status = freeTrialDays > 0 ? 'trial' : 'active';

        // Insert subscription
        db.run(`
            INSERT INTO customer_subscriptions (
                customerId, planId, status, startDate, endDate, trialEndDate,
                autoRenew, nextBillingDate, currentPeriodStart, currentPeriodEnd
            ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `, [customerId, planId, status, start, endDate, trialEnd, nextBillingDate, start, endDate]);

        saveDatabase();

        // Get the created subscription
        const newSub = db.exec(`
            SELECT * FROM customer_subscriptions
            WHERE customerId = ? AND planId = ?
            ORDER BY createdAt DESC LIMIT 1
        `, [customerId, planId]);

        res.status(201).json({
            message: 'Subscription created successfully',
            subscription: {
                id: newSub[0].values[0][0],
                status,
                startDate: start,
                endDate,
                trialEndDate: trialEnd,
                nextBillingDate
            }
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// Cancel subscription
router.put('/cancel/:subscriptionId', (req, res) => {
    try {
        const db = getDb();
        const { subscriptionId } = req.params;
        const { cancelReason } = req.body;

        db.run(`
            UPDATE customer_subscriptions
            SET status = 'cancelled',
                cancelledAt = datetime('now'),
                cancelReason = ?,
                autoRenew = 0,
                updatedAt = datetime('now')
            WHERE id = ?
        `, [cancelReason || 'Customer request', subscriptionId]);

        saveDatabase();

        res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// Reactivate subscription
router.put('/reactivate/:subscriptionId', (req, res) => {
    try {
        const db = getDb();
        const { subscriptionId } = req.params;

        db.run(`
            UPDATE customer_subscriptions
            SET status = 'active',
                cancelledAt = NULL,
                cancelReason = NULL,
                autoRenew = 1,
                updatedAt = datetime('now')
            WHERE id = ?
        `, [subscriptionId]);

        saveDatabase();

        res.json({ message: 'Subscription reactivated successfully' });
    } catch (error) {
        console.error('Error reactivating subscription:', error);
        res.status(500).json({ error: 'Failed to reactivate subscription' });
    }
});

// Track usage (for usage-based plans)
router.post('/usage', (req, res) => {
    try {
        const db = getDb();
        const { subscriptionId, customerId, usageType, quantity, unitPrice, description } = req.body;

        if (!subscriptionId || !customerId || !usageType || !quantity || !unitPrice) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const amount = quantity * unitPrice;
        const recordDate = new Date().toISOString().split('T')[0];

        db.run(`
            INSERT INTO usage_records (
                subscriptionId, customerId, usageType, quantity,
                unitPrice, amount, description, recordDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [subscriptionId, customerId, usageType, quantity, unitPrice, amount, description, recordDate]);

        // Update usage count
        db.run(`
            UPDATE customer_subscriptions
            SET usageCount = usageCount + ?,
                updatedAt = datetime('now')
            WHERE id = ?
        `, [quantity, subscriptionId]);

        saveDatabase();

        res.status(201).json({
            message: 'Usage recorded successfully',
            amount,
            quantity
        });
    } catch (error) {
        console.error('Error recording usage:', error);
        res.status(500).json({ error: 'Failed to record usage' });
    }
});

module.exports = router;
