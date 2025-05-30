import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuid } from "uuid";

//modelo de dados de produto na regra de negocio
// do nosso lado poder ter um modelo a se seguir, diferente do dynamo
export interface Product {
  id: string;
  productName: string;
  code: string;
  price: string;
  model: string;
}

//classe de repository de produtos - para fazer as operações de acesso e tudo mais
export class ProductsRepository {
  private ddbClient: DocumentClient;
  private productsDdb: string;

  constructor(ddbClient: DocumentClient, productsDdb: string) {
    this.ddbClient = ddbClient;
    this.productsDdb = productsDdb;
  }

  //retorna todos os produtos por meio de uma lista
  async getAllProducts(): Promise<Product[]> {
    const data = await this.ddbClient
      .scan({
        TableName: this.productsDdb,
      })
      .promise();

    //devolver como uma lista de produtos
    return data.Items as Product[];
  }

  // getProductById - get
  async getProductById(productId: string): Promise<Product> {
    const productResult = await this.ddbClient
      .get({
        Key: {
          id: productId,
        },
        TableName: this.productsDdb,
      })
      .promise();
    //checar se realmente achamos o elemento na tabela
    if (productResult.Item) {
      return productResult.Item as Product;
    } else {
      throw new Error("Product not fou");
    }
  }
  //create product
  async create(product: Product): Promise<Product> {
    product.id = uuid();
    await this.ddbClient
      .put({
        TableName: this.productsDdb,
        Item: product,
      })
      .promise();
    return product;
  }

  //apagar um product by id
  //atenção paraa duas requiisições na tabela do dynamoDB
  // é importante notar que no dynamoDB eh importante nao fazer mtas operações no dynamoDB
  async deleteProduct(productId: string): Promise<Product> {
    const data = await this.ddbClient
      .delete({
        TableName: this.productsDdb,
        Key: {
          id: productId,
        },
        ReturnValues: "ALL_OLD",
      })
      .promise();
    if (data.Attributes) {
      return data.Attributes as Product;
    } else {
      throw new Error("Product not Found");
    }
  }

  //update a project receiving a product id and the product itself
  async updateProduct(productId: string, product: Product): Promise<Product> {
    const data = await this.ddbClient
      .update({
        TableName: this.productsDdb,
        //pk definida la no dynamoDb
        Key: {
          id: productId,
        },
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "UPDATED_NEW",
        //query que eu vou atualizar as coisas de fato
        UpdateExpression:
          "set productName = :n, code = :c, price = :p, model = :m",
        //o que essas expressões vão receber mesmo de fato
        ExpressionAttributeValues: {
          ":n": product.productName,
          ":c": product.code,
          ":p": product.price,
          ":m": product.model,
        },
      })
      .promise();
    data.Attributes!.id = productId;
    return data.Attributes as Product;
  }
}
