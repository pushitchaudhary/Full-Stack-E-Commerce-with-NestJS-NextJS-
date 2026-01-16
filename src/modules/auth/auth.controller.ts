import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import { RefreshTokenGuard } from './guards/refresh.token.guards';
import { GetUser } from 'src/common/decorators/get.user.decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { LoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // Register api
    @Post('register')
    @HttpCode(201)
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
       return this.authService.register(registerDto);
    }

    // Refresh access token api
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshTokenGuard)
    async refreshToken(@GetUser('id') userId: string): Promise<AuthResponseDto> {
        return this.authService.refreshTokens(userId);
    }

    // Logout User and invalidate refresh token
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async logout(@GetUser('id') userId: string): Promise<{message : string}> {
        await this.authService.logout(userId);
        return { message: 'Logout successfully' };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

}
