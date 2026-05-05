import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cadastrar usuário' })
    register(@Body() body: CreateUserDto) {
        return this.authService.register(body);
    }

    @Post('login')
    @ApiOperation({ summary: 'Fazer login' })
    login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retorna o usuario auenticado' })
    me(@Req() req: any) {
        return req.user;
    }
}
