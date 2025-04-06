import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as mongoose from 'mongoose';
import * as moment from 'moment-timezone';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: userDto.email });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const user = new this.userModel({
      ...userDto,
      birthday: moment.tz(userDto.birthday, userDto.timezone).toDate(),
      birthdayMonthDay: moment
        .tz(userDto.birthday, userDto.timezone)
        .format('MM-DD'),
    });

    return await user.save();
  }

  async findById(id: string): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, userDto: UpdateUserDto): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const existingUser = await this.userModel.findOne({
      email: userDto.email,
    });

    if (userDto.email) {
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already in use');
      }
    }

    const timezone = existingUser?.timezone || userDto.timezone;
    if (userDto.birthday) {
      userDto.birthday = moment
        .tz(userDto.birthday, timezone as string)
        .toDate();
      userDto.birthdayMonthDay = moment
        .tz(userDto.birthday, timezone as string)
        .format('MM-DD');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, userDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
  }
}
