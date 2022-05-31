import { ConfigService } from "@nestjs/config";
import { MulterModuleAsyncOptions } from "@nestjs/platform-express";
import { imageFileFilter } from "src/users/utils/file-upload.utils";

export const multerConfig: MulterModuleAsyncOptions = {
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => {
		return {
			limits: {
				fileSize: +configService.get<string>('AVATAR_MAX_SIZE'),
			},
			fileFilter: imageFileFilter,
		};
	},
};
