import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
import { ValidationPipe } from '@nestjs/common';
import { readFileSync } from 'node:fs';

async function bootstrap() {
  // HTTPS
  const httpsOptions = {
    key: readFileSync('../secrets/key.pem'),
    cert: readFileSync('../secrets/cert.pem'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });

  // CORS: not needed for serve_static
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser({}));
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(new ValidationPipe());

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Transcendence back-end')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
