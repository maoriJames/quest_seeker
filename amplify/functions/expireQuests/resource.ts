import { Construct } from 'constructs'
import { Duration } from 'aws-cdk-lib'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import * as lambdaTypes from 'aws-cdk-lib/aws-lambda'

// Define argument type
interface ResourceProps {
  scope: Construct
  lambda: lambdaTypes.IFunction
}

export function resource({ scope, lambda }: ResourceProps) {
  // Give Lambda permission to call AppSync
  lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['appsync:GraphQL'],
      resources: ['*'], // tighten later
    })
  )

  // Schedule Lambda to run every hour
  new Rule(scope, 'ExpireQuestsSchedule', {
    schedule: Schedule.rate(Duration.hours(1)),
    targets: [new LambdaFunction(lambda)],
  })
}
