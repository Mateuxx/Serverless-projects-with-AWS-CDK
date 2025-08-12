// Criar a tabela para guardar eventos deve ser em uma stack separada pois precisamos 
// fazer uso da mesmo em outras partes da aplicação. Quando temos essa reutilização 
// o ideal é desacloparmos a dependencia de uma stack por alguma especifica. 

import * as cdk from "aws-cdk-lib";
import * as dynamoDb  from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

// Essa stack é responsável por criar a tabela de eventos no DynamoDB, que será usada para
// armazenar eventos de produtos, como criação, atualização e exclusão. A tabela terá chaves compostas
// e será configurada com capacidade provisionada para leitura e escrita.
export class EventsDdbStack extends cdk.Stack {
    readonly table: dynamoDb.Table;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Criar a tabela de eventos
        this.table = new dynamoDb.Table(this, "EventsDdb", {
            tableName: "events",
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Política de destruição da tabela ao destruir a stack
            //Trabalhando com tabela do dynamoDb com chaves compostas
            partitionKey: {
                name: "pk",
                type: dynamoDb.AttributeType.STRING,
            },
            sortKey: {
                name: "sk",
                type: dynamoDb.AttributeType.STRING,
            },
            billingMode: dynamoDb.BillingMode.PROVISIONED, // Modo de cobrança provisionado
            readCapacity: 1, // Capacidade de leitura provisionada
            writeCapacity: 1, // Capacidade de escrita provisionada
        });
    }
}