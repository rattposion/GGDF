import 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    jwt?: string;
  }
}

declare module 'express' {
  interface Request {
    session?: any;
  }
} 