import {
  Body,
  Controller,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials-dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/signup')
  signup(@Body(ValidationPipe) authCredentials: AuthCredentialsDto) {
    return this.authService.signUp(authCredentials);
  }

  @Post('/signin')
  signin(@Body(ValidationPipe) authCredentials: AuthCredentialsDto) {
    return this.authService.signIn(authCredentials);
  }

}
