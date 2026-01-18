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
  backend.mutateQuest.resources.lambda as lambda.Function
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
  })
)

notificationLambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
)

profileTable.grantReadData(notificationLambda)

notificationLambda.addEnvironment('PROFILE_TABLE_NAME', profileTable.tableName)
