import { defineBackend } from '@aws-amplify/backend'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { FunctionUrlAuthType, StartingPosition } from 'aws-cdk-lib/aws-lambda'

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

const webhookLambda = backend.stripeWebhook.resources.lambda

webhookLambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE, // Stripe needs public access
  cors: {
    allowedOrigins: ['*'], // Or specifically 'https://stripe.com'
  },
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

// Cast the lambdas as you did before
const stripeSessionLambda = backend.createStripeSession.resources
  .lambda as lambda.Function
const stripeWebhookLambda = backend.stripeWebhook.resources
  .lambda as lambda.Function

// 1. Pass User Pool ID
stripeSessionLambda.addEnvironment(
  'AMPLIFY_USER_POOL_ID',
  backend.auth.resources.userPool.userPoolId,
)
stripeWebhookLambda.addEnvironment(
  'AMPLIFY_USER_POOL_ID',
  backend.auth.resources.userPool.userPoolId,
)

// 2. Pass Data Endpoint using the L1 construct property
const graphqlUrl =
  backend.data.resources.cfnResources.cfnGraphqlApi.attrGraphQlUrl

stripeSessionLambda.addEnvironment('AMPLIFY_DATA_ENDPOINT', graphqlUrl)
stripeWebhookLambda.addEnvironment('AMPLIFY_DATA_ENDPOINT', graphqlUrl)

// Allow the Stripe functions to call the AppSync API
backend.data.resources.graphqlApi.grantMutation(
  backend.stripeWebhook.resources.lambda,
)
backend.data.resources.graphqlApi.grantQuery(
  backend.createStripeSession.resources.lambda,
)

// Explicitly grant the Lambda permission to read the Profile table
backend.data.resources.tables['Profile'].grantReadData(
  backend.createStripeSession.resources.lambda as lambda.Function,
)
