import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cron from 'node-cron';
import * as moment from 'moment-timezone';
import { User, UserDocument } from '../user/entities/user.entity';

@Injectable()
export class BirthdayWorker {
  private readonly logger = new Logger(BirthdayWorker.name);
  private readonly MAX_RETRIES = 3;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  onModuleInit() {
    this.startBirthdayJob();
  }

  private startBirthdayJob() {
    cron.schedule('0 * * * *', async () => {
      this.logger.log('Running birthday worker...');
      await this.retryCheckAndSendBirthdayMessages(0);
      this.logger.log('Birthday worker finished running.');
    });
  }

  private async retryCheckAndSendBirthdayMessages(
    attempt: number,
  ): Promise<void> {
    try {
      await this.checkAndSendBirthdayMessages();
    } catch (error) {
      if (attempt < this.MAX_RETRIES) {
        this.logger.warn(
          `Retry ${attempt + 1} to run checkAndSendBirthdayMessages...`,
        );
        await this.retryCheckAndSendBirthdayMessages(attempt + 1);
      } else {
        this.logger.error(
          `checkAndSendBirthdayMessages failed after ${this.MAX_RETRIES} attempts: ${(error as Error).message}`,
        );
      }
    }
  }

  public async checkAndSendBirthdayMessages() {
    const now = moment.utc();
    const today = now.format('MM-DD');
    const yesterday = now.clone().subtract(1, 'days').format('MM-DD');
    const tomorrow = now.clone().add(1, 'days').format('MM-DD');
    const monthDay = [today, yesterday, tomorrow];

    try {
      const users = await this.userModel
        .find({ birthdayMonthDay: { $in: monthDay } })
        .exec();

      for (const user of users) {
        try {
          const userTime = moment.tz(now, user.timezone);
          const birthday = moment.tz(user.birthday, user.timezone);

          const alreadySent =
            user.lastBirthdayMessageSentAt &&
            moment(user.lastBirthdayMessageSentAt).isSame(userTime, 'day');

          if (
            userTime.format('MM-DD') === birthday.format('MM-DD') &&
            userTime.hour() === 9 && // 9 AM local time
            !alreadySent
          ) {
            this.sendBirthdayMessage(user.name);

            user.lastBirthdayMessageSentAt = userTime.toDate();
            await user.save();
          }
        } catch (error) {
          throw new Error(
            `Failed to process user ${user.name}: ${(error as Error).message}`,
          );
        }
      }
    } catch (error) {
      throw new Error(`Failed: ${(error as Error).message}`);
    }
  }

  private sendBirthdayMessage(name: string) {
    this.logger.log(`🎉 Happy Birthday, ${name}! 🎂`);
  }
}
