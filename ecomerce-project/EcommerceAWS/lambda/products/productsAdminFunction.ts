import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import {
  Product,
  ProductsRepository,
} from "./layers/productsLayer/productRepository";

//TODO - essas constantes/imports nao parecem ser a melhor coisa, pode haver um jeito melhor?
//dynamo dbClient
const ddbClient = new DocumentClient();
//pegar do .env o nome do dynamoDb
const productsDb = process.env.PRODUCTS_DB!;
//productRepository - import from layer
const productsRepository = new ProductsRepository(ddbClient, productsDb);

//Responsavel por manter as coisas de admin products
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;

  //criar um novo produto
  if (event.resource === "/products") {
    if (method === "POST") {
      console.log("POST /products");
      try {
        //pego esse json vindo do payload
        const productData = JSON.parse(event.body!);
        const product = productData as Product; //Trasnforma esse objeto no tipo da interface Product

        const productCreated = productsRepository.create(product);

        return {
          statusCode: 201, //created this is for created
          body: JSON.stringify(productCreated),
        };
      } catch (error) {
        console.error((<Error>error).message);

        return {
          statusCode: 404, // failed to create a product error
          body: (<Error>error).message,
        };
      }
    }
  } else if (event.resource === `/products/{id}`) {
    //alteração de produto
    if (event.httpMethod === "PUT") {
      const productId = event.pathParameters!.id as string;
      console.log(` PUT /products/${productId}`);
      //pego o produto passado pelo payload
      const product = JSON.parse(event.body!) as Product;
      try {
        const productUpdated = await productsRepository.updateProduct(
          productId,
          product
        );

        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated), // o produto que eu apaguei
        };
      } catch (error) {
        console.error((<Error>error).message);
        //retornar not found(404) caso n ache o produto
        return {
          statusCode: 404, //product not found
          body: (<Error>error).message,
        };
      }

      //atualização de produto
    } else if (event.httpMethod === "DELETE") {
      const productId = event.pathParameters!.id as string;
      console.log(` DELETE /products/${productId}`);
      try {
        const deletedProduct = productsRepository.deleteProduct(productId);

        return {
          statusCode: 200,
          body: JSON.stringify(deletedProduct), // retorna o produto que eu apaguei
        };
      } catch (ConditionalCheckFailedException) {
        //retornar not found(404) caso n ache o produto
        return {
          statusCode: 404,
          body: "Product not Found",
        };
      }
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
