import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { UsersModule } from 'src/users/users.module';
import { MockAuthController } from './mock_auth.controller';

@Module({
  controllers: [MockAuthController],
  imports: [
    UsersModule,
		JwtModule.registerAsync(jwtConfig)],
})
export class MockAuthModule {}
