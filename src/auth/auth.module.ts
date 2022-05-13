import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraStrategy } from './strategy/intra.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
	imports: [PassportModule, UsersModule, JwtModule.register({
      secret: process.env.JWT_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRY }
    })
],
	controllers: [AuthController],
	providers: [AuthService, IntraStrategy, JwtStrategy]
})
export class AuthModule {}
