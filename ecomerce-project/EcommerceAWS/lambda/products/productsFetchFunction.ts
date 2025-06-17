import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { error } from "console";
import { ProductsRepository } from "./layers/productsLayer/productRepository";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

//dynamo dbClient
const ddbClient = new DocumentClient();
//pegar do .env o nome do dynamoDb
const productsDb = process.env.PRODUCTS_DB!;

//productRepository - import from layer
const productsRepository = new ProductsRepository(ddbClient, productsDb);

// this is the lambda handler for handle fetch products operations
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  // id da funcção lambda e tals - identifica unicamente a requisição pela api gateway
  // const lambdaRequestId = context.awsRequestId;
  // const apiRequestID = event.requestContext.re;

  // see on the cloudwatch!!
  // gera custo na função lambda - cuidado com os logs - latencia e tals
  const mehtod = event.httpMethod;
  if (event.resource === "/products") {
    if (mehtod === "GET") {
      console.log("GET/products");

      //get all the products from dynamoDb
      const products = await productsRepository.getAllProducts();

      return {
        statusCode: 200, //OK
        body: JSON.stringify(products),
      };
    }
  } else if (event.resource === `/products{id}`) {
    const productId = event.pathParameters!.id as string;

    console.log(` GET /products/${productId}`);

    //podemos nao encontrar um produto, portanto precisamos de um tratamento de erros
    try {
      const product = await productsRepository.getProductById(productId);

      return {
        statusCode: 200, //ok retornou
        body: JSON.stringify(product),
      };
    } catch (error) {
      console.error((<Error>error).message);

      //retornar not found(404) caso n ache o produto
      return {
        statusCode: 404, //not found
        body: (<Error>error).message,
      };
    }
  }

  return {
    statusCode: 400, // bad request,
    body: JSON.stringify({
      message: "Bad request",
    }),
  };
}
