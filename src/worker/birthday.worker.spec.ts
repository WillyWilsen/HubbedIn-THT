import { Test, TestingModule } from '@nestjs/testing';
import { BirthdayWorker } from './birthday.worker';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user/entities/user.entity';
import * as moment from 'moment-timezone';
import { Logger } from '@nestjs/common';

describe('BirthdayWorker', () => {
  let worker: BirthdayWorker;
  let logSpy: jest.SpyInstance;
  let mockUserModel: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthdayWorker,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    worker = module.get<BirthdayWorker>(BirthdayWorker);
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should send a birthday message if it is 9 AM in user timezone', async () => {
    const today = moment().format('YYYY-MM-DD');

    const mockUsers = [
      {
        name: 'Alice',
        birthday: moment(today).tz('America/New_York').format(),
        timezone: 'America/New_York',
      },
      {
        name: 'Bob',
        birthday: moment(today).tz('Europe/London').format(),
        timezone: 'Europe/London',
      },
    ];

    mockUserModel.find.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(mockUsers),
    });

    jest.spyOn(moment, 'utc').mockReturnValue(moment.utc().hour(13)); // 13:00 UTC = 9 AM Eastern Time

    await worker.checkAndSendBirthdayMessages();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('🎉 Happy Birthday, Alice! 🎂'),
    );
  });
});
