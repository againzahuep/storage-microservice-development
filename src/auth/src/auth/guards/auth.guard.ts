import { AuthGuard } from "@nestjs/passport";

export class AuthGuard implements CanActivate {

     canActivate(context: ExecutionContext): boolean {
         const request = context.switchToHttp().getRequest();
         const token = request.headers['authorization']?.split(' ')[1];
         try {
           this.jwt.verify(token);
           return true;
         } catch (error) {
                   console.log(error);
          throw new RpcException({
             status: 401,
             message: 'Invalid token'
           })
           return false;
         }
     }
      return request.session.userId;
    }