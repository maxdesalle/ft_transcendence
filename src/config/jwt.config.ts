import { ConfigService } from "@nestjs/config";
import { JwtModuleAsyncOptions } from "@nestjs/jwt";

export const jwtConfig: JwtModuleAsyncOptions = {
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => {
		return {
			secret: configService.get<string>('JWT_TOKEN_SECRET'),
			signOptions: {
				expiresIn: configService.get<string>('JWT_TOKEN_EXPIRY')
			},
		};
	},
};
