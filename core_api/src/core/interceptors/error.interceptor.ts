import {
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	Injectable,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class DetailedErrorInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> {
		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const ctx = context.getClass().name;
		const handler = context.getHandler().name;

		return next.handle().pipe(
			catchError((err: Error | HttpException) => {
				const status = err instanceof HttpException ? err.getStatus() : 500;

				const detailedError = {
					controller: ctx,
					handler: handler,
					url: request.url,
					method: request.method,
					status: 'error',
					message: err.message,
				};

				console.error(detailedError);

				response.status(status).json(detailedError);

				return throwError(() => err);
			}),
		);
	}
}
