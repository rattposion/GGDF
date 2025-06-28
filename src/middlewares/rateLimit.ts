import rateLimit from 'express-rate-limit';

export const steamRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 requisições por minuto por IP
  message: {
    error: 'Limite de requisições à Steam atingido. Tente novamente em instantes.'
  }
}); 