
// To generate refresh tokens use this command:
// node -e "console.log(require('crypto').randomBytes(124).toString('hex'))" 

// Refresh Token Strategy implementation will go here
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExtractJwt } from 'passport-jwt';
import * as bcrypt from 'bcrypt';



@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    
    constructor( 
        private configService: ConfigService,
        private primsa: PrismaService
    ){
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration : false,
            secretOrKey : configService.get('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    // Validate Refresh Token
    async validate(req: Request, payload: { sub: string; email: string }) {
        console.log('Refresh Token Strategy payload validate called');
        console.log('Payload:', {sub: payload.sub, email: payload.email});

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('No Authorization header found');
            throw new UnauthorizedException('No Refresh Token Found');
        }

        const refreshToken = authHeader.replace('Bearer ', '').trim();
        if(!refreshToken) {
            console.log('No Refresh Token found in Authorization header');
            throw new UnauthorizedException('Refresh token is empty after extraction');
        }

        const user = await this.primsa.user.findUnique({
            where: { id: payload.sub },
            select : {
                id: true,
                email: true,
                role: true,
                refreshTokens: true,
            }
        });

        if(!user || !user.refreshTokens) {
            console.log('User not found or no refresh tokens stored');
            throw new UnauthorizedException('Invalid Refresh Token');
        }

        const refreshTokenMatch = await bcrypt.compare(refreshToken, user.refreshTokens);

        if(!refreshTokenMatch) {
            console.log('Refresh token does not match stored hash');
            throw new UnauthorizedException('Invalid Refresh Token');
        }

        return { id: user.id, email: user.email, role: user.role };
    }

}