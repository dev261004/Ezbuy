import {Router}  from 'express';
import { loginSeller, logoutSeller, registerSeller,refreshAccessToken } from '../controllers/seller.controllers.js';
import { verifyJWT } from '../middlewares/authseller.middlewares.js';

const router = Router();

router.route("/register").post(registerSeller)
router.route("/login").post(loginSeller)

//secured routes
router.route("/logout").post(verifyJWT,logoutSeller)
router.route(".refresh-token").post(refreshAccessToken)


export default router