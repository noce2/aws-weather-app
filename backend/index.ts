import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from "aws-lambda";
import * as axios from 'axios';

// index.ts
const GREETING = "Hello, AWS!";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log(GREETING);
  const response = await axios.default.get('/data/2.5/weather?q=Nottingham&appid=f8f55f720d21aa96b080dd969e2d696e',
  {
    baseURL: 'https://api.openweathermap.org'
  });
  if(response && response.status === 200) {
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    };
  } 
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
