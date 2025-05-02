import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  if (event.resource === "/products") {
    if (method === "POST") {
      console.log("POST /products");
      return {
        statusCode: 201, //created
        body: "POST /products",
      };
    }
  } else if (event.resource === `/products/{id}`) {
    if (event.httpMethod === "PUT") {
      const productId = event.pathParameters!.id as string;
      console.log(` PUT /products/${productId}`);
      return {
        statusCode: 200,
        body: ` PUT /products/${productId}`,
      };
    } else if (event.httpMethod === "DELETE") {
      const productId = event.pathParameters!.id as string;
      console.log(` DELETE /products/${productId}`);
      return {
        statusCode: 200,
        body: ` DELETE /products/${productId}`,
      };
    }
  }

  // returns a error in a casa of failure?
  return {
    statusCode: 400, // bad request,
    body: JSON.stringify({
      message: "Bad request",
    }),
  };
}
