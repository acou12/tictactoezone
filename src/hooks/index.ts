import * as cookie from 'cookie';
import type { Handle, GetSession } from '@sveltejs/kit';

export const handle: Handle = async ({ request, resolve }) => {
	const cookies = cookie.parse(request.headers.cookie || '');
	const jwt =
		cookies.token &&
		Buffer.from(cookies.token.split('.')[1], 'base64').toString('utf-8');
	request.locals.user = jwt ? JSON.parse(jwt) : null;
	return await resolve(request);
};

export const getSession: GetSession = async ({ locals }) => {
	return { ...(locals.user ?? {}), authenticated: locals.user != null };
};
