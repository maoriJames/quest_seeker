// import { defineFunction } from "@aws-amplify/backend";
// import { Construct } from "constructs";
// import * as lambdaTypes from "aws-cdk-lib/aws-lambda";
// import { Rule, Schedule } from "aws-cdk-lib/aws-events";
// import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
// import { PolicyStatement } from "aws-cdk-lib/aws-iam";

// export const expireQuests = defineFunction({
//   entry: "./src/index.ts",   // relative to function folder
//   runtime: "nodejs18.x",     // Gen 2 runtime
//   environment: {
//     APPSYNC_API_URL: process.env.APPSYNC_API_URL || "",
//     APPSYNC_API_KEY: process.env.APPSYNC_API_KEY || "",
//   },
//   onCreate: (scope, lambda) => {
//     // Attach AppSync permission
//     lambda.addToRolePolicy(
//       new PolicyStatement({
//         actions: ["appsync:GraphQL"],
//         resources: ["*"],
//       })
//     );

//     // Schedule Lambda to run daily at midnight UTC
//     new Rule(scope, "ExpireQuestsSchedule", {
//       schedule: Schedule.cron({ minute: "0", hour: "0" }),
//       targets: [new LambdaFunction(lambda)],
//     });
//   },
// });

import { defineFunction } from '@aws-amplify/backend'

export const myFirstFunction = defineFunction({
  name: 'my-first-function',
  entry: './handler.ts',
})
