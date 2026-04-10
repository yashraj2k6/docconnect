const express = require('express');
const router = express.Router();
const { adminLogin, getAllData, deleteRecord, updateRecord } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Add a simple check for admin token
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as admin' });
    }
};

router.post('/login', adminLogin);
router.get('/data', protect, isAdmin, getAllData);
router.delete('/:type/:id', protect, isAdmin, deleteRecord);
router.put('/:type/:id', protect, isAdmin, updateRecord);

module.exports = router;
