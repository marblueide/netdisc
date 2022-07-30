import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useSwagger } from './plugins/swagger/useSwagger';
import {resolve,parse, join} from "path"
import { graphqlUploadExpress } from 'graphql-upload';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }))
  app.use(graphqlUploadExpress({maxFieldSize:2 * 1024 * 1024}))
  // app.useStaticAssets(join(__dirname, '../static'));
  await useSwagger(app);
  await app.listen(3000);
}
bootstrap();

const path = resolve("static","user",'test1')
console.log(path)
