import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  Validate,
} from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as moment from 'moment-timezone';

@ValidatorConstraint({ name: 'isValidTimezone', async: false })
export class IsValidTimezoneConstraint implements ValidatorConstraintInterface {
  validate(timezone: string) {
    return moment.tz.zone(timezone) !== null;
  }

  defaultMessage(args: ValidationArguments) {
    return `'${args.value}' is not a valid IANA timezone`;
  }
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  @IsNotEmpty()
  birthday: Date;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidTimezoneConstraint)
  timezone: string;
}
