import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, maxLength, MinLength } from "class-validator";

// Data Transfer Object for user registration
export class RegisterDto {

    @IsEmail({}, { message: 'Please Provide Email Address' }) 
    @IsNotEmpty({ message: 'Email should not be empty' })
    email: string;

    @IsNotEmpty({ message: 'Password should not be empty' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(20, { message: 'Password must be at most 20 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, { message: 'Password too weak. It must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' })
    password : string;

    @IsNotEmpty({ message: 'First Name should not be empty' })
    @IsString({ message: 'First Name must be a string' })
    @MaxLength(30, { message: 'First Name must be at most 30 characters long' })
    @MinLength(3, { message: 'First Name must be at least 3 characters long' })
    firstName: string;

    @IsNotEmpty({ message: 'Last Name should not be empty' })
    @IsString({ message: 'Last Name must be a string' })
    @MaxLength(30, { message: 'Last Name must be at most 30 characters long' })
    @MinLength(3, { message: 'Last Name must be at least 3 characters long' })
    lastName: string;

    
    
}