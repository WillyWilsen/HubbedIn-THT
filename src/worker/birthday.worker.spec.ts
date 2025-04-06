import { Test, TestingModule } from '@nestjs/testing';
import { BirthdayWorker } from './birthday.worker';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user/entities/user.entity';
import * as moment from 'moment-timezone';
import { Logger } from '@nestjs/common';

const mockUserModel = {
  find: jest.fn(),
};

describe('BirthdayWorker', () => {
  let worker: BirthdayWorker;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
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
        save: jest.fn().mockResolvedValue(true),
      },
      {
        name: 'Bob',
        birthday: moment(today).tz('Europe/London').format(),
        timezone: 'Europe/London',
        save: jest.fn().mockResolvedValue(true),
      },
    ];

    mockUserModel.find.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(mockUsers),
    });

    jest
      .spyOn(moment, 'tz')
      .mockReturnValue(moment.tz('2024-04-04 09:00:00', 'America/New_York'));

    await worker.checkAndSendBirthdayMessages();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('🎉 Happy Birthday, Alice! 🎂'),
    );
  });
});
