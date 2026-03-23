import * as iam from 'aws-cdk-lib/aws-iam'
import { defineBackend } from '@aws-amplify/backend'
import * as lambda from 'aws-cdk-lib/aws-lambda'

import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'
import { expiredQuests } from './functions/expiredQuests/resource'
import { postRegistration } from './functions/postRegistration/resource'
import { joinQuest } from './functions/joinQuest/resource'
import { becomeCreator } from './functions/becomeCreator/resource'
import { mutateQuest } from './functions/mutateQuest/resource'
import { createQuestEntrySession } from './functions/createQuestEntrySession/resource'
import { createStripeSession } from './functions/createStripeSession/resource'
import { stripeWebhook } from './functions/stripeWebhook/resource'

const backend = defineBackend({
  auth,
  data,
  storage,
  expiredQuests,
  postRegistration,
  joinQuest,
  becomeCreator,
  mutateQuest,
  createQuestEntrySession,
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

// --- Stripe Webhook & Session Setup ---

const stripeWebhookLambda = backend.stripeWebhook.resources
  .lambda as lambda.Function
const stripeSessionLambda = backend.createStripeSession.resources
  .lambda as lambda.Function
const joinQuestLambda = backend.joinQuest.resources.lambda as lambda.Function

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
backend.data.resources.graphqlApi.grantQuery(stripeSessionLambda)
backend.data.resources.tables['Profile'].grantReadData(stripeSessionLambda)
questTable.grantReadData(joinQuestLambda)

questTable.grantReadWriteData(stripeWebhookLambda)
stripeWebhookLambda.addEnvironment('QUEST_TABLE_NAME', questTable.tableName)
joinQuestLambda.addEnvironment('QUEST_TABLE_NAME', questTable.tableName)

// -----------------------------
// joinQuest permissions
// -----------------------------
const userQuestTable = backend.data.resources.tables['UserQuest']
userQuestTable.grantReadWriteData(joinQuestLambda)
joinQuestLambda.addEnvironment(
  'USER_QUEST_TABLE_NAME',
  userQuestTable.tableName,
)

profileTable.grantReadWriteData(joinQuestLambda)
joinQuestLambda.addEnvironment('PROFILE_TABLE_NAME', profileTable.tableName)

userQuestTable.grantReadWriteData(stripeWebhookLambda)
stripeWebhookLambda.addEnvironment(
  'USER_QUEST_TABLE_NAME',
  userQuestTable.tableName,
)
profileTable.grantReadWriteData(stripeWebhookLambda)
stripeWebhookLambda.addEnvironment('PROFILE_TABLE_NAME', profileTable.tableName)

// -----------------------------
// SES Permissions
// -----------------------------
const sesPolicy = new iam.PolicyStatement({
  actions: ['ses:SendEmail', 'ses:SendRawEmail'],
  resources: ['*'],
})

joinQuestLambda.addToRolePolicy(sesPolicy)
stripeWebhookLambda.addToRolePolicy(sesPolicy)

const cognitoPolicy = new iam.PolicyStatement({
  actions: ['cognito-idp:AdminGetUser'],
  resources: [backend.auth.resources.userPool.userPoolArn],
})

joinQuestLambda.addToRolePolicy(cognitoPolicy)
stripeWebhookLambda.addToRolePolicy(cognitoPolicy)

joinQuestLambda.addEnvironment(
  'AMPLIFY_USER_POOL_ID',
  backend.auth.resources.userPool.userPoolId,
)
