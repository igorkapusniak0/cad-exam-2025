/* eslint-disable import/extensions, import/no-absolute-path */
import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { Bid, DBBid } from "../shared/types";


const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event) => {
  console.log("Event ", JSON.stringify(event));

  const record = event.Records[0].Sns;
  const bid: Bid = JSON.parse(record.Message);

  if (!bid.bidId){
    console.log("invalid bid")
    return;
  }

  const dBBid : DBBid = {
    ...bid,
    timeStamp: new Date().toString(),
  }

  await ddbDocClient.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
        Item: {
          ...dBBid,
        },
    })
  );
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
