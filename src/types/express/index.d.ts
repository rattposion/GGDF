import 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    jwt?: string;
  }
}

declare module 'express' {
  interface User {
    id: string;
    // Adicione outros campos conforme necessário
  }
  interface Request {
    user?: User;
    session?: any;
  }
} 