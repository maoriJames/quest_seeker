import { defineFunction } from '@aws-amplify/backend'

export const sendNotification = defineFunction({
  name: 'send-notification',
  entry: './handler.ts',
  // This breaks the circular dependency by placing the function
  // into the same CloudFormation stack as your DynamoDB tables.
  resourceGroupName: 'data',
})
