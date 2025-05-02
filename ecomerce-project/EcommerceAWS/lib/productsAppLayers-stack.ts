import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Code, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

//stack para criação de layers
export class ProductsAppLayersStack extends Stack {
  readonly productsLayers: LayerVersion;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //layer infra 
    this.productsLayers = new LayerVersion(this, "ProductsLayer", {
      code: Code.fromAsset("lambda/products/layers/productsLayer"), // onde vai estar a layer
      compatibleRuntimes: [Runtime.NODEJS_20_X],
      layerVersionName: "ProductsLayer",
      removalPolicy: RemovalPolicy.RETAIN,
    });
    //O SSM Parameter Store é uma maneira centralizada de armazenar e compartilhar o ARN da layer entre diferentes stacks ou serviços.
    new StringParameter(this, "ProductsLayerVersionArn", {
        parameterName: "ProductsLayerVersionArn",
        stringValue: this.productsLayers.layerVersionArn
    })

  }
}
