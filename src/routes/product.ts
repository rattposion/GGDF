import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { z } from 'zod';
import { validate } from '../middlewares/validate';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  ownerId: z.number().int().positive()
});
const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  price: z.number().positive().optional()
});

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', validate(productSchema), createProduct);
router.put('/:id', authenticateJWT, validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticateJWT, deleteProduct);

export default router; 