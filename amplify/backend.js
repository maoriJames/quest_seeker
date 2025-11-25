import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFirstFunction } from './functions/my-first-function/resource';
import { expiredQuests } from './functions/expiredQuests/resource';
/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
    auth,
    data,
    storage,
    myFirstFunction,
    expiredQuests,
});
