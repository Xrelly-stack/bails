import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeCommunitiesSocket } from './communities.js';
import { makeInteropSocket } from './interop.js';
import { makePrivacySocket } from './privacy.js';
import { makeGraphQLSocket } from './graphql.js';
import { makeMessageBuilderSocket } from './message-builder.js';

/**
 * Compose the legacy Xrelly socket stack with the additional wbails layers.
 * The legacy newsletter implementation remains below these optional layers.
 */
const makeWASocket = config => {
  const newConfig = {
    ...DEFAULT_CONNECTION_CONFIG,
    ...config
  };

  const base = makeCommunitiesSocket(newConfig);
  const interop = makeInteropSocket(base);
  const privacy = makePrivacySocket(interop);
  const graphQL = makeGraphQLSocket(privacy);
  return makeMessageBuilderSocket(graphQL);
};

export default makeWASocket;
