import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

// this is the lambda handler
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  // id da funcção lambda e tals - identifica unicamente a requisição pela api gateway
  // const lambdaRequestId = context.awsRequestId;
  // const apiRequestID = event.requestContext.re;

  // see on the cloudwatch
  // gera custo na função lambda - cuidado com os logs - latencia e tals
  console.log(
    // `API Gateway Request ID ${apiRequestID} - Lambda Request ID: ${lambdaRequestId}`
  );
  const mehtod = event.httpMethod;
  if (event.resource === "/products") {
    if (mehtod === "GET") {
      console.log("GET");
    }
    return {
      statusCode: 200, //OK
      body: JSON.stringify({
        message: "GET products - OK",
      }),
    };
  }

  return {
    statusCode: 400, // bad request,
    body: JSON.stringify({
      message: "Bad request",
    }),
  };
}
