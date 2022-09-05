import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraStrategy } from './strategy/intra.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtTwoFactorStrategy } from './strategy/tfa.strategy';
import { jwtConfig } from 'src/config/jwt.config';

@Module({
	imports:[
		PassportModule,
		UsersModule,
		JwtModule.registerAsync(jwtConfig),
	],
	controllers: [AuthController],
	providers: [AuthService, IntraStrategy, JwtStrategy, JwtTwoFactorStrategy]
})
export class AuthModule {}
