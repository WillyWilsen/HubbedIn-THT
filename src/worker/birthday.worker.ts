import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cron from 'node-cron';
import * as moment from 'moment-timezone';
import { User } from '../user/entities/user.entity';

@Injectable()
export class BirthdayWorker {
  private readonly logger = new Logger(BirthdayWorker.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  onModuleInit() {
    this.startBirthdayJob();
  }

  private startBirthdayJob() {
    cron.schedule('0 * * * *', async () => {
      this.logger.log('Running birthday worker...');
      await this.checkAndSendBirthdayMessages();
    });
  }

  public async checkAndSendBirthdayMessages() {
    const now = moment.utc();
    const users = await this.userModel.find().exec();

    users.forEach((user) => {
      const userTime = moment.tz(now, user.timezone);
      const birthday = moment(user.birthday).tz(user.timezone);

      if (
        userTime.format('MM-DD') === birthday.format('MM-DD') &&
        userTime.hour() === 9
      ) {
        this.sendBirthdayMessage(user.name);
      }
    });
  }

  private sendBirthdayMessage(name: string) {
    this.logger.log(`🎉 Happy Birthday, ${name}! 🎂`);
  }
}
