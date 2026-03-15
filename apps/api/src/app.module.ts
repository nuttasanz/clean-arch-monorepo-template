import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { DrizzleModule } from './infrastructure/database/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [LoggerModule.forRoot({ useExisting: true }), DrizzleModule, AuthModule],
})
export class AppModule {}
