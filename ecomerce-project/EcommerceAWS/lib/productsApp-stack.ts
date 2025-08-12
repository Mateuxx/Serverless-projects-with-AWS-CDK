import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

//interface para a stack de produtos para receber eventsDdb agora ProductAppStack tem receber eventsDdb



//stack related to the products resources
export class ProductsAppStack extends Stack {
  // referencia da lambda dentro dessa stack
  //exportar função para usar em outra stack ou passa por uma api gateway (o que é o que queremos aqui!!!)
  readonly prodructsFetchHandler: lambdaNodeJS.NodejsFunction;
  //nova função lambda para as paradas de
  readonly prodructsAdminHandler: lambdaNodeJS.NodejsFunction;
  readonly productsDdb: Table;

  // scope - onde vai ser inserido
  // props - algumas propriedades
  // id a id dessa parada memo
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Create a table on dynamoDb
    this.productsDdb = new Table(this, "ProductsDdb", {
      tableName: "products",
      removalPolicy: RemovalPolicy.DESTROY, //Politica de destruição da tabela ao destruir uma task - geralmente eh mantido
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    // trazer o layer para essa stack de produtos
    const productsLayersArn = StringParameter.valueForStringParameter(
      this,
      "ProductsLayerVersionArn"
    );
    // Ai como a cada deply muda a versão da layer vc nao precisa ir mudar manualmente na criação da layer
    const productsLayers = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "ProductsLayerVersionArn",
      productsLayersArn
    );

    //criação da lambda products
    this.prodructsFetchHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "ProductsFetchFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        functionName: "ProductsFetchFunction",
        entry: "lambda/products/productsFetchFunction.ts", //caminho de aonde está a minha lambda de fatoo
        handler: "handler",
        memorySize: 512, // memoria que a funcção lamda tem que ter
        timeout: Duration.seconds(5),
        bundling: {
          minify: true, //deixar a função lambda mais otimizada possivel
          sourceMap: false,
        },
        //pegar o nome da tabela por .env
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName,
        },
        layers: [productsLayers], // pode buscar trechos de código por esse layer
      }
    );

    //permitir que a tabela possa ser lida por prodructsFetchHandler
    this.productsDdb.grantReadData(this.prodructsFetchHandler);

    //lambda pra admin
    this.prodructsAdminHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "ProductsAdminFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        functionName: "ProductsAdminFunction",
        entry: "lambda/products/productsAdminFunction.ts", //caminho de aonde está a minha lambda de fatoo
        handler: "handler",
        memorySize: 512, // memoria que a funcção lamda tem que ter
        timeout: Duration.seconds(5),
        bundling: {
          minify: true, //deixar a função lambda mais otimizada possivel
          sourceMap: false,
        },
        //pegar o nome da tabela por .env
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName,
        },
        layers: [productsLayers],
      }
    );
    //permissões apenas para escrita
    this.productsDdb.grantWriteData(this.prodructsAdminHandler);
  }
}
