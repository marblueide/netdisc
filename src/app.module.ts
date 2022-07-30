import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphqlModule } from './graphql/graphql.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath:join(__dirname,"../static")
    }),
    GraphqlModule,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService:ConfigService) => {
        const databse = configService.getMySQLDataKey();
        return {
          type: 'mysql',
          host: databse.host,
          port: databse.port,
          username: databse.username,
          password: databse.password,
          database: databse.name,
          autoLoadEntities: true,
          synchronize: true,
        }
      },
      inject:[ConfigService]
    }),
    UserModule,
    AuthModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
