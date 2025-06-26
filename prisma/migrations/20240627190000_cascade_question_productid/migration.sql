ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_productId_fkey";
ALTER TABLE "Question" ADD CONSTRAINT "Question_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE; 