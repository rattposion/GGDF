import { Router } from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

// Upload de entrega automática (arquivo)
router.post('/:id/auto-delivery', authenticate, upload.single('file'), async (req, res) => {
  // Salve o arquivo e associe ao produto
  // Exemplo: await prisma.product.update({ where: { id: req.params.id }, data: { deliveryType: 'file', deliveryFile: req.file.path } });
  res.json({ success: true, file: req.file });
});

export default router; 