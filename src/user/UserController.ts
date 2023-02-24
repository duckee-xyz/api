import { Delete, Get, Path, Post, Request, Route, Security, Tags } from '@tsoa/runtime';
import Koa from 'koa';
import { Service } from 'typedi';
import { UserRepository } from './UserRepository';

@Service()
@Tags('User')
@Route('/user/v1')
export class UserController {
  constructor(private userRepository: UserRepository) {}

  /**
   * @summary Get My Details
   */
  @Get('/me')
  @Security('JWT')
  async getMyProfile(@Request() { user }: Koa.Request) {
    const userDetails = await this.userRepository.details(user.id);
    return { userDetails };
  }

  /**
   * @summary Get User Details
   */
  @Get('/:id')
  async getDetails(@Path() id: number) {
    const userDetails = await this.userRepository.details(id);
    return { userDetails };
  }

  /**
   * @summary Follow User
   */
  @Post('/:id/follow')
  @Security('JWT')
  async follow(@Request() { user: me }: Koa.Request, @Path() id: number) {
    await this.userRepository.follow(me, id);
  }

  /**
   * @summary Unfollow User
   */
  @Delete('/:id/follow')
  @Security('JWT')
  async unfollow(@Request() { user: me }: Koa.Request, @Path() id: number) {
    await this.userRepository.unfollow(me, id);
  }
}
