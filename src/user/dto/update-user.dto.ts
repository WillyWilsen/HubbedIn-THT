import {
  IsString,
  IsEmail,
  IsDateString,
  Validate,
  IsOptional,
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

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @IsOptional()
  @IsString()
  @Validate(IsValidTimezoneConstraint)
  timezone?: string;
}
