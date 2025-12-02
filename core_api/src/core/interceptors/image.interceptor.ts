import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function ImageInterceptor(fieldName = 'file') {
	return UseInterceptors(
		FileInterceptor(fieldName, {
			storage: diskStorage({
				destination: './public/uploads',
				filename: (req, file, callback) => {
					const uniqueSuffix =
						Date.now() + '-' + Math.round(Math.random() * 1e9);
					callback(
						null,
						`${uniqueSuffix}${extname(file.originalname)}`,
					);
				},
			}),
			fileFilter: (req, file, callback) => {
				if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
					return callback(
						new Error('Only image files accepted'),
						false,
					);
				}
				callback(null, true);
			},
			limits: { fileSize: 5 * 1024 * 1024 },
		}),
	);
}
