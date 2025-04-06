import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, type: Date })
  birthday: Date;

  @Prop({ required: true })
  birthdayMonthDay: string;

  @Prop({ required: true })
  timezone: string;

  @Prop({ type: Date, default: null })
  lastBirthdayMessageSentAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
