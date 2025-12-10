import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const override = (fn: any) => {
  const lambda = fn.resources.lambda

  lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['appsync:GraphQL'],
      resources: ['*'],
    })
  )

  new Rule(fn.scope, 'ExpireQuestsDaily', {
    schedule: Schedule.cron({ hour: '0', minute: '0' }),
    targets: [new LambdaFunction(lambda)],
  })

  lambda.addEnvironment('APPSYNC_API_URL', process.env.APPSYNC_API_URL ?? '')
  lambda.addEnvironment('APPSYNC_API_KEY', process.env.APPSYNC_API_KEY ?? '')
}
