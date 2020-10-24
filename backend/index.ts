import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from "aws-lambda";

// index.ts
const GREETING = "Hello, AWS!";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(GREETING);
  return {
    statusCode: 200,
    body: JSON.stringify({
      greeting: GREETING
    }),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  };
}
