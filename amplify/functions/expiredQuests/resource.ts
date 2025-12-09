import { Construct } from 'constructs'
import * as lambdaTypes from 'aws-cdk-lib/aws-lambda'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { defineFunction } from '@aws-amplify/backend'

export const expiredQuests = defineFunction((scope: Construct) => {
  const lambda = new lambdaTypes.Function(scope, 'ExpireQuestsLambda', {
    runtime: lambdaTypes.Runtime.NODEJS_18_X,
    handler: 'index.handler',
    code: lambdaTypes.Code.fromAsset(
      './amplify/functions/expiredQuests/dist' // <-- FIXED
    ),
    environment: {
      APPSYNC_API_URL: process.env.APPSYNC_API_URL || '',
      APPSYNC_API_KEY: process.env.APPSYNC_API_KEY || '',
    },
  })

  lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['appsync:GraphQL'],
      resources: ['*'],
    })
  )

  new Rule(scope, 'ExpireQuestsSchedule', {
    schedule: Schedule.cron({ minute: '0', hour: '0' }),
    targets: [new LambdaFunction(lambda)],
  })

  return lambda
})
