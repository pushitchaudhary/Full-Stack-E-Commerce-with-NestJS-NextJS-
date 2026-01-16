import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth.response.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,   private jwtService: JwtService) {}



    // Register User
    async register(registerDto: RegisterDto) : Promise<AuthResponseDto> {
        const { email, password, firstName, lastName } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }
        
        try {
            const hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS as string));

            const newUser = await this.prisma.user.create({
                data: {
                    email,
                    password: hashPassword,
                    firstName,
                    lastName,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    password:false,
                },
            });
            
            const tokens = await this.generateToken(newUser.id, newUser.email);

            await this.updateRefreshTokenHash(newUser.id, tokens.refreshToken);

            return { ...tokens, user: newUser };
        

        } catch (error) {
            console.error('Error during user registration:', error);
            throw new InternalServerErrorException('An error occurred during registration');
        }
    }

    // Generate JWT Token
    private async generateToken(userId: string, email: string): Promise<{ accessToken: string, refreshToken: string }> {
        // Implementation for generating JWT token

        const payload = { sub: userId, email };
        const refresId = randomBytes(16).toString('hex');

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as any),
            this.jwtService.signAsync({ ...payload }, { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN || '7d' } as any),
        ]);

        return {accessToken,refreshToken,};
    }

    // Update Refresh Token Hash
    private async updateRefreshTokenHash(userId: string, refreshToken: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokens: refreshToken },
        });
    }

    // Refresh Access Token
    async refreshTokens (userId: string): Promise<AuthResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                password:false,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const tokens = await this.generateToken(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return { ...tokens, user };
    }

    // Logout User
    async logout(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokens: null },
        });
    }

    // Login Method 
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
    
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const tokens = await this.generateToken(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return { 
            ...tokens, 
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
        } };    
    }
}
