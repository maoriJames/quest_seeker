import * as iam from 'aws-cdk-lib/aws-iam'
import { defineBackend } from '@aws-amplify/backend'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'

import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'

import { expiredQuests } from './functions/expiredQuests/resource'
import { sendNotification } from './functions/sendNotification/resource'
import { postRegistration } from './functions/postRegistration/resource'
import { joinQuest } from './functions/joinQuest/resource'
import { becomeCreator } from './functions/becomeCreator/resource'
import { mutateQuest } from './functions/mutateQuest/resource'
import { createStripeSession } from './functions/createStripeSession/resource'
import { stripeWebhook } from './functions/stripeWebhook/resource'

const backend = defineBackend({
  auth,
  data,
  storage,
  expiredQuests,
  sendNotification,
  postRegistration,
  joinQuest,
  becomeCreator,
  mutateQuest,
  createStripeSession,
  stripeWebhook,
})

// -----------------------------
// Tables
// -----------------------------
const questTable = backend.data.resources.tables['Quest']
const profileTable = backend.data.resources.tables['Profile']

// -----------------------------
// mutateQuest permissions
// -----------------------------
questTable.grantReadWriteData(
  backend.mutateQuest.resources.lambda as lambda.Function,
)

backend.mutateQuest.addEnvironment('QUEST_TABLE_NAME', questTable.tableName)

// -----------------------------
// Notification Lambda
// -----------------------------
const notificationLambda = backend.sendNotification.resources
  .lambda as lambda.Function

notificationLambda.addEventSource(
  new DynamoEventSource(questTable, {
    startingPosition: StartingPosition.LATEST,
  }),
)

notificationLambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  }),
)

profileTable.grantReadData(notificationLambda)

notificationLambda.addEnvironment('PROFILE_TABLE_NAME', profileTable.tableName)
// --- Stripe Webhook & Session Setup ---

const stripeWebhookLambda = backend.stripeWebhook.resources
  .lambda as lambda.Function
const stripeSessionLambda = backend.createStripeSession.resources
  .lambda as lambda.Function

// 1. Unified Function URL Configuration
stripeWebhookLambda.addFunctionUrl({
  authType: lambda.FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    // Remove OPTIONS and ensure strings are uppercase
    allowedMethods: [lambda.HttpMethod.POST],
    allowedHeaders: ['content-type', 'stripe-signature'],
  },
})

// 2. The "Magic" Resource Policy for Public Access
stripeWebhookLambda.addPermission('StripePublicInvoke', {
  principal: new iam.AnyPrincipal(),
  action: 'lambda:InvokeFunctionUrl',
  functionUrlAuthType: lambda.FunctionUrlAuthType.NONE,
})

// 3. Environment Variables
// 3. Environment Variables
const graphqlUrl =
  backend.data.resources.cfnResources.cfnGraphqlApi.attrGraphQlUrl

const stripeLambdas = [stripeWebhookLambda, stripeSessionLambda]
stripeLambdas.forEach((l) => {
  l.addEnvironment(
    'AMPLIFY_USER_POOL_ID',
    backend.auth.resources.userPool.userPoolId,
  )
  l.addEnvironment('AMPLIFY_DATA_ENDPOINT', graphqlUrl)
})

// 4. API Permissions
backend.data.resources.graphqlApi.grantMutation(stripeWebhookLambda)
backend.data.resources.graphqlApi.grantQuery(stripeSessionLambda)
backend.data.resources.tables['Profile'].grantReadData(stripeSessionLambda)

questTable.grantWriteData(stripeWebhookLambda)
stripeWebhookLambda.addEnvironment('QUEST_TABLE_NAME', questTable.tableName)
