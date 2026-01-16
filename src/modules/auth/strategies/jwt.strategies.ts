// To generate JWT secret use this command:
// node -e "console.log(require('crypto').randomBytes(124).toString('hex'))"


// Jwt Strategy file is unchanged
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService, private configService: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    // Valid jwt payload
    async validate(payload: { sub: string; email: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                password: false,
                createdAt: true,
                updatedAt: true,
            },  
        });

        if(!user){
            throw new UnauthorizedException('Unauthorized');
        }

        return user;
    }

}