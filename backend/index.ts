import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from "aws-lambda";

// index.ts
const GREETING = "Hello, AWS!";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => {
  console.log(GREETING);
  return {
    statusCode: 200,
    body: GREETING
  };
}
