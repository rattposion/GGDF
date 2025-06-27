import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

router.post('/sub', authenticate, createSubcategory);
router.put('/sub/:id', authenticate, updateSubcategory);
router.delete('/sub/:id', authenticate, deleteSubcategory);

export default router; 