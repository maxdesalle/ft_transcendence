import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

export const typeormConfig: TypeOrmModuleAsyncOptions = {
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => {
		return {
			type: "postgres",
			host: configService.get<string>('DB_HOST'),
			port: +configService.get('DB_PORT'),
			username: "postgres",
			password: configService.get<string>('DB_PASSWORD'),
			database: "postgres",
			entities: ["dist/**/*.entity{.ts,.js}"],
			synchronize: true
		};
	},
}