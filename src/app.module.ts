import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { BirthdayWorker } from './worker/birthday.worker';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, BirthdayWorker],
})
export class AppModule {}
