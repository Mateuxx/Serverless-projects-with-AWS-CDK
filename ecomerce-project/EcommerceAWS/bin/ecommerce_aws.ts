#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Environment } from "aws-cdk-lib";
import { ProductsAppStack } from "../lib/productsApp-stack";
import { EcommerceApiStack } from "../lib/ecommerceApi-stack";
import { ProductsAppLayersStack } from "../lib/productsAppLayers-stack";

//this is like a launcher
const app = new cdk.App();

const env: Environment = {
  account: "463470964328",
  region: "us-east-1",
};

const tags = {
  cost: "Ecommerce",
  team: "projepo_pp",
};

//ProductsAppLayers stack
const productsAppLayersStack = new ProductsAppLayersStack(
  app,
  "ProductAppLayers",
  {
    tags: tags,
    env: env,
  }
);

//criação da productStack
const productsAppStack = new ProductsAppStack(app, "ProductsAppStack", {
  tags: tags,
  env: env,
});

// create the api gateway stack
const apiGatewayStack = new EcommerceApiStack(app, "EcommerceApiStack", {
  productsFetchHanlder: productsAppStack.prodructsFetchHandler, // passando a instancia da função handler
  productsAdminHanlder: productsAppStack.prodructsAdminHandler,
  tags: tags,
  env: env,
});
apiGatewayStack.addDependency(productsAppStack);
