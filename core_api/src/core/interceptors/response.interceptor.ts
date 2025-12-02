import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';

export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
	intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
		const request = context.switchToHttp().getRequest<Request>();
		const ctx = context.getClass().name;
		const handler = context.getHandler().name;

		return next.handle().pipe(
			map((data) => {
				const safeData =
					typeof data === 'object' && data !== null
						? data
						: { result: data };

				const response = {
					controller: ctx,
					handler: handler,
					url: request.url,
					method: request.method,
					status: 'success',
					...safeData,
				};
				
				console.log(response);

				return response;
			}),
		);
	}
}
