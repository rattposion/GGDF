import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import cloudinary from '../services/cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const form = new formidable.IncomingForm();
  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (err) return res.status(500).json({ error: 'Erro no upload' });
    let file: File | undefined;
    if (Array.isArray(files.file)) file = files.file[0];
    else file = files.file as File;
    if (!file) return res.status(400).json({ error: 'Arquivo não enviado' });
    try {
      const upload = await cloudinary.uploader.upload(file.filepath, { folder: 'marketplace' });
      fs.unlinkSync(file.filepath);
      return res.status(200).json({ url: upload.secure_url });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao enviar para Cloudinary' });
    }
  });
} 