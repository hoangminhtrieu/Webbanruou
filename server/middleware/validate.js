// ============================================================
// Middleware: Validation (express-validator)
// ============================================================
const { body, param, query, validationResult } = require('express-validator');

// ─── Helper: kiểm tra kết quả validate ──────────────────────
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Dữ liệu không hợp lệ',
            details: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

// ─── Auth ────────────────────────────────────────────────────
const validateRegister = [
    body('email')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự')
        .matches(/[A-Z]/).withMessage('Mật khẩu phải có ít nhất 1 chữ hoa')
        .matches(/[0-9]/).withMessage('Mật khẩu phải có ít nhất 1 chữ số'),
    body('full_name')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự'),
    body('phone')
        .optional()
        .matches(/^(0|\+84)[0-9]{8,10}$/).withMessage('Số điện thoại không hợp lệ'),
    validate,
];

const validateLogin = [
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
    validate,
];

// ─── Product ─────────────────────────────────────────────────
const validateProductCreate = [
    body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Tên sản phẩm phải từ 2-200 ký tự'),
    body('region').notEmpty().withMessage('Vùng sản xuất không được để trống'),
    body('type').isIn(['red', 'white', 'sparkling', 'whisky', 'rose', 'other']).withMessage('Loại sản phẩm không hợp lệ'),
    body('price').isInt({ min: 1000 }).withMessage('Giá phải là số nguyên dương (tối thiểu 1,000đ)'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Tồn kho phải là số nguyên không âm'),
    body('abv').optional().isFloat({ min: 0, max: 100 }).withMessage('ABV phải từ 0-100%'),
    validate,
];

const validateProductFilter = [
    query('type').optional().isIn(['red', 'white', 'sparkling', 'whisky', 'rose', 'other']),
    query('minPrice').optional().isInt({ min: 0 }),
    query('maxPrice').optional().isInt({ min: 0 }),
    query('minScore').optional().isInt({ min: 50, max: 100 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('sort').optional().isIn(['popular', 'price_asc', 'price_desc', 'rating', 'newest']),
    validate,
];

// ─── Cart ────────────────────────────────────────────────────
const validateCartAdd = [
    body('productId').isInt({ min: 1 }).withMessage('ID sản phẩm không hợp lệ'),
    body('qty').optional().isInt({ min: 1, max: 100 }).withMessage('Số lượng phải từ 1-100'),
    validate,
];

const validateCartUpdate = [
    body('qty').isInt({ min: 0, max: 100 }).withMessage('Số lượng phải từ 0-100'),
    validate,
];

// ─── Order ───────────────────────────────────────────────────
const validateOrderCreate = [
    body('items').isArray({ min: 1 }).withMessage('Giỏ hàng không được trống'),
    body('items.*.productId').isInt({ min: 1 }).withMessage('ID sản phẩm không hợp lệ'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('Số lượng tối thiểu là 1'),
    body('items.*.price').isInt({ min: 0 }).withMessage('Giá sản phẩm không hợp lệ'),
    body('address.name').trim().notEmpty().withMessage('Tên người nhận không được để trống'),
    body('address.phone').matches(/^(0|\+84)[0-9]{8,10}$/).withMessage('Số điện thoại không hợp lệ'),
    body('address.street').trim().notEmpty().withMessage('Địa chỉ không được để trống'),
    body('address.district').trim().notEmpty().withMessage('Quận/Huyện không được để trống'),
    body('address.city').trim().notEmpty().withMessage('Tỉnh/Thành phố không được để trống'),
    body('paymentMethod').isIn(['vnpay', 'momo', 'stripe', 'cod']).withMessage('Phương thức thanh toán không hợp lệ'),
    body('shippingMethod').optional().isIn(['standard', 'express', 'cold_chain']),
    validate,
];

// ─── Payment ─────────────────────────────────────────────────
const validatePaymentCreate = [
    body('orderId').isInt({ min: 1 }).withMessage('ID đơn hàng không hợp lệ'),
    body('returnUrl').optional().isURL().withMessage('returnUrl không hợp lệ'),
    validate,
];

// ─── Review ──────────────────────────────────────────────────
const validateReview = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải từ 1-5'),
    body('comment').optional().trim().isLength({ max: 500 }).withMessage('Nhận xét tối đa 500 ký tự'),
    validate,
];

// ─── ID param ────────────────────────────────────────────────
const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID không hợp lệ'),
    validate,
];

module.exports = {
    validate,
    validateRegister,
    validateLogin,
    validateProductCreate,
    validateProductFilter,
    validateCartAdd,
    validateCartUpdate,
    validateOrderCreate,
    validatePaymentCreate,
    validateReview,
    validateId,
};
