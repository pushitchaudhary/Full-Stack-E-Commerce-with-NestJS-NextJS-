import { IsEmail, IsEmpty, IsNotEmpty, IsString, Max, MaxLength, MinLength } from "class-validator";


// Login Dto
export class LoginDto {

    @IsNotEmpty({ message: 'Username is not allowed' })
    @IsEmail({}, { message: 'Invalid email address' })
    @MaxLength(50, { message: 'Email must be at most 50 characters long' })
    @MinLength(5, { message: 'Email must be at least 5 characters long' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MaxLength(20, { message: 'Password must be at most 20 characters long' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}