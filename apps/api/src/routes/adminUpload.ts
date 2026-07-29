import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'

export const adminUploadRouter = Router()

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'application/pdf', 'video/mp4', 'video/webm',
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Tipo de archivo no permitido'))
      return
    }
    cb(null, true)
  },
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

adminUploadRouter.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Bad Request', message: 'No se recibió archivo', statusCode: 400 })
      return
    }
    const folder = (req.query.tipo as string) === 'documento' ? 'elite/documentos' : 'elite/cms'
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { secure_url: string })
        },
      )
      stream.end(req.file!.buffer)
    })
    res.json({ url: result.secure_url })
  } catch (err) { next(err) }
})
