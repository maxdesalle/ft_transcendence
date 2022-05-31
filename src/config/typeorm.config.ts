import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

export const typeormConfig: TypeOrmModuleAsyncOptions = {
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => {
		return {
			type: "postgres",
			host: "127.0.0.1",
			port: 5432,
			username: "postgres",
			password: configService.get<string>('DB_PASSWORD'),
			database: "postgres",
			entities: ["dist/**/*.entity{.ts,.js}"],
			synchronize: true
		};
	},
}