import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { ConflictException } from '@nestjs/common';

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let userModel: typeof mockUserModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
  });

  it('should create a user successfully', async () => {
    const userDto = {
      email: 'test@example.com',
      name: 'Test User',
      birthday: new Date('1990-01-01'),
      timezone: 'America/New_York',
    };
    service.create = jest.fn().mockResolvedValue(userDto);

    const result = await service.create(userDto);
    expect(result).toEqual(userDto);
  });

  it('should throw conflict exception if email exists', async () => {
    const userDto = {
      email: 'test@example.com',
      name: 'Test User',
      birthday: new Date('1990-01-01'),
      timezone: 'America/New_York',
    };

    userModel.findOne.mockResolvedValue(userDto);

    await expect(service.create(userDto)).rejects.toThrow(ConflictException);
  });
});
