import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { validateEnv } from '../../config/env';
import { DrizzleModule } from '../../infrastructure/database/drizzle.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    DrizzleModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const env = validateEnv();
        return {
          secret: env.JWT_ACCESS_SECRET,
          signOptions: { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, RefreshTokenRepository],
  exports: [JwtModule, UserRepository],
})
export class AuthModule {}
