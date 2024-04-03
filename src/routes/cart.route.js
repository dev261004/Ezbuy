import {Router}  from 'express';
import { getCartById,removeCart,addItem } from '../controllers/cart.controllers.js';
const router = Router();

router.route("/").get(getCartById);

router.route('/').post(addItem);

router.route('/:itemId').delete(removeCart);

export default router

