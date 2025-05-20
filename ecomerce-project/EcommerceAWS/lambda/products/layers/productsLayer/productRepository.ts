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
