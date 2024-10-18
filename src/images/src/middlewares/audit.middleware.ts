import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const user = req.user ? req.user.username : 'Anonymous';
    console.log(`User: ${user} uploaded a file at ${new Date().toISOString()}`);
    next();
  }
}
