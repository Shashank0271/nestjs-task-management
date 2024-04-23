import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import JwtPayload from './jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //method to extract the jwt
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  //before calling this function the signature in the incoming token
  //has been verified by passport.js
  //if it was not valid an error would have been thrown and this would not be called
  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = this.userRepository.findOneBy({ username });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
  /*
        AuthGuard -> name of strategy is mentioned , 
        Take the 'provided' class that has that strategy name ,
        Execute , 
        from the validate method the user is being returned , 
        this USER is being ADDED TO THE REQUEST OBJECT
    */
}
