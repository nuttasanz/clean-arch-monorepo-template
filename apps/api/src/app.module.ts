import { Module } from '@nestjs/common';
import { DrizzleModule } from './infrastructure/database/drizzle.module';

@Module({ imports: [DrizzleModule] })
export class AppModule {}
