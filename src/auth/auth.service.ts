import {
  Body,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials-dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import JwtPayload from './jwt-payload.interface';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(
    @Body(ValidationPipe) authCredentials: AuthCredentialsDto,
  ): Promise<void> {
    const { username, password } = authCredentials;

    const hashedPassword = await bcrypt.hash(password, 8);

    const user: User = this.userRepository.create({
      username: username,
      password: hashedPassword,
    });

    try {
      await this.userRepository.save(user);
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException('username already exists');
      } else {
        throw new InternalServerErrorException('error while creating the user');
      }
    }
  }

  async signIn(
    @Body(ValidationPipe) authcredentials: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authcredentials;

    const requiredUser: User = await this.userRepository.findOneBy({
      username: username,
    });

    if (!requiredUser) {
      throw new NotFoundException(
        `user with username ${username} does not exist`,
      );
    }

    const hashedPassword: string = requiredUser.password;
    const isMatch: boolean = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('username or password is incorrect !');
    }
    const payload: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payload);
    //this token is going to be used to authenticate the further requests
    return { accessToken };
  }
}
