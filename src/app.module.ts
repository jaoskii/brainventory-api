import { Module } from '@nestjs/common';
import { AuthModule } from './v1/auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
