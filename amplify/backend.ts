import { defineBackend } from '@aws-amplify/backend'
import * as lambda from "aws-cdk-lib/aws-lambda";
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'
import { expiredQuests } from './functions/expiredQuests/resource'
import { sendNotification } from './functions/sendNotification/resource'

const backend = defineBackend({
  auth,
  data,
  storage,
  expiredQuests,
  sendNotification,
})

const notificationLambda = backend.sendNotification.resources.lambda as lambda.Function;

const questTable = backend.data.resources.tables["Quest"]; 
const profileTable = backend.data.resources.tables["Profile"]; // Access the Profile table

// 1. Trigger from Quest table
notificationLambda.addEventSource(new DynamoEventSource(questTable, {
  startingPosition: StartingPosition.LATEST,
}));

// 2. Grant SES permission
notificationLambda.addToRolePolicy(new PolicyStatement({
  actions: ["ses:SendEmail", "ses:SendRawEmail"],
  resources: ["*"],
}));

// 3. Grant DynamoDB Read permission for the Profile table
profileTable.grantReadData(notificationLambda);

// 4. Pass the Profile table name to the Lambda environment
notificationLambda.addEnvironment("PROFILE_TABLE_NAME", profileTable.tableName);