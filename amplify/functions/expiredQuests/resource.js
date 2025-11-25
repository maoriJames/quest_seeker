import * as lambdaTypes from 'aws-cdk-lib/aws-lambda'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { defineFunction } from '@aws-amplify/backend'
export const expiredQuests = defineFunction((scope) => {
  const lambda = new lambdaTypes.Function(scope, 'ExpireQuestsLambda', {
    runtime: lambdaTypes.Runtime.NODEJS_18_X,
    handler: 'index.handler',
    code: lambdaTypes.Code.fromAsset('./src'), // points to your src folder
    environment: {
      // eslint-disable-next-line no-undef
      APPSYNC_API_URL: process.env.APPSYNC_API_URL || '',
      // eslint-disable-next-line no-undef
      APPSYNC_API_KEY: process.env.APPSYNC_API_KEY || '',
    },
  })
  // Add AppSync permission
  lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['appsync:GraphQL'],
      resources: ['*'],
    })
  )
  // Schedule to run daily at midnight UTC
  new Rule(scope, 'ExpireQuestsSchedule', {
    schedule: Schedule.cron({ minute: '0', hour: '0' }),
    targets: [new LambdaFunction(lambda)],
  })
  return lambda
})
