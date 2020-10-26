const GREETING = "Hello, AWS!";

export const main = async (event, context) => {
  console.log(GREETING);
  return {
    statusCode: 200,
    body: JSON.stringify({
      greeting: GREETING
    })
  };
}
