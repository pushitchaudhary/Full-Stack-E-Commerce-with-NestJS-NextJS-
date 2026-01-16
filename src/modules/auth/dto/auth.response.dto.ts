import { Role } from "@prisma/client";

// Auth Response DTO
export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user : {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role : Role;
    };
}