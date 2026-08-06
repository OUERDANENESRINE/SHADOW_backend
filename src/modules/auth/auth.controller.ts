import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './login.dto';
import { CreateUserDto } from '../users/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const user = await this.usersService.create(createUserDto);
    const { access_token, user: userData } = await this.authService.login(user);

    res.cookie('access_token', access_token, cookieOptions);

    return { user: userData };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.motDePasse,
    );
    const { access_token, user: userData } = await this.authService.login(user);

    res.cookie('access_token', access_token, cookieOptions);

    return { user: userData };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: ExpressResponse) {
    res.clearCookie('access_token', cookieOptions);
    return { message: 'Déconnecté' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  getProfile(@Request() req: any) {
    return req.user;
  }
}