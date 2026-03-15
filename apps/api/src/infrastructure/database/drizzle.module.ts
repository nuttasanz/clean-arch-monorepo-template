import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { DRIZZLE_SQL, DrizzleSql, DrizzleSqlProvider, DrizzleProvider } from './drizzle.provider';

@Global()
@Module({
  providers: [DrizzleSqlProvider, DrizzleProvider],
  exports: [DrizzleProvider],
})
export class DrizzleModule implements OnModuleDestroy {
  constructor(@Inject(DRIZZLE_SQL) private readonly sql: DrizzleSql) {}

  async onModuleDestroy(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }
}
