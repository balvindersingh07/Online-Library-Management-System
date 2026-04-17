/** Minimal OpenAPI 3 for Swagger UI (matches REST surface). */
export const openApiSpec = {
  openapi: '3.0.0',
  info: { title: 'Libra Library API', version: '1.0.0' },
  paths: {
    '/health': { get: { summary: 'health', responses: { '200': { description: 'ok' } } } },
    '/auth/register': {
      post: {
        summary: 'register',
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } },
            },
          },
        },
        responses: { '201': { description: 'created' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'login',
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } },
            },
          },
        },
        responses: { '200': { description: 'token' } },
      },
    },
    '/auth/me': { get: { summary: 'me', security: [{ bearerAuth: [] }] } },
    '/books': {
      get: { summary: 'list books' },
      post: { summary: 'create book (admin)', security: [{ bearerAuth: [] }] },
    },
    '/borrow/{book_id}': { post: { summary: 'borrow', security: [{ bearerAuth: [] }] } },
    '/return/{book_id}': { post: { summary: 'return', security: [{ bearerAuth: [] }] } },
    '/me/borrows': { get: { summary: 'my borrows', security: [{ bearerAuth: [] }] } },
    '/upload': { post: { summary: 'upload cover (admin)', security: [{ bearerAuth: [] }] } },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
}
