import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { HtmlController } from './html.controller';
import { HtmlService } from './html.service';

@Module({
  imports: [UsersModule],
  controllers: [HtmlController],
  providers: [HtmlService],
  exports: [HtmlService]
})
export class HtmlModule {}
