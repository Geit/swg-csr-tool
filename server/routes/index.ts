import httpProxy from 'http-proxy';

import { ensureRawRequest } from '../../../../src/core/server/http/router';
import { IRouter } from '../../../../src/core/server';

const proxy = httpProxy.createProxyServer();

export function defineRoutes(router: IRouter) {
  router.post(
    {
      path: '/api/swg_csr_tool/graphql',
      validate: false,
      options: {
        xsrfRequired: false,
        tags: ['access:csrToolGraphQl'],
      },
    },
    async (context, request, response) => {
      const proxyUrl = await context.core.uiSettings.client.get('csrToolGraphQlUrl');
      await new Promise(resolve => {
        const rawRequest = ensureRawRequest(request);
        // Simply proxy the request through to swg-graphql.
        proxy.web(rawRequest.raw.req, rawRequest.raw.res, { target: proxyUrl }, e => {
          resolve(e);
        });
      });

      return response.ok();
    }
  );
}
