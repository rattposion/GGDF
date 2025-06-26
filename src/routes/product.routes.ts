import { Router } from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductQuestions, getProductReviews, createProductQuestion, createProductReview, getTopProductsByCategory } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/', getProducts);
router.get('/top-by-category', getTopProductsByCategory);
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

// Upload de imagem de produto
router.post('/upload-image', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  // Monta a URL pública da imagem
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

router.get('/:id/questions', getProductQuestions);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/questions', authenticate, createProductQuestion);
router.post('/:id/reviews', authenticate, createProductReview);

export default router; 