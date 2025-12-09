import { defineBackend } from '@aws-amplify/backend'

import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'
import { expiredQuests } from './functions/expiredQuests/resource'

import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'

const backend = defineBackend({
  auth,
  data,
  storage,
  expiredQuests,
})

// 1️⃣ Add environment variables using the Amplify Function wrapper
backend.expiredQuests.addEnvironment(
  'APPSYNC_API_URL',
  process.env.APPSYNC_API_URL ?? ''
)

backend.expiredQuests.addEnvironment(
  'APPSYNC_API_KEY',
  process.env.APPSYNC_API_KEY ?? ''
)

// 2️⃣ IAM permissions are attached to the underlying CDK lambda
const lambda = backend.expiredQuests.resources.lambda

lambda.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ['appsync:GraphQL'],
    resources: ['*'],
  })
)

// 3️⃣ Add EventBridge Schedule
new Rule(lambda, 'ExpireQuestsSchedule', {
  schedule: Schedule.cron({ minute: '0', hour: '0' }),
  targets: [new LambdaFunction(lambda)],
})

export default backend
