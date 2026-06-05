import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario?.verificado) {
      throw new ForbiddenException(
        'Apenas usuários verificados podem realizar esta ação.',
      );
    }

    return true;
  }
}