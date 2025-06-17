# Product Lambda Notes

## ProductsAdmin

### Como Admin de produto eu quero:

1. Criar um novos produto
   1. POST /products
   2. Erros:
      1. produto nao adicionado
   3. Payload Example
      1. {
            productName: "Notebook",
            code: "NTB001",
            price: "5000.00",
            model: "UltraSlim"
        }
2. Editar um produto que ja existe
   1. PUT - product/{productID}
   2. modificar um produto pelo seu id
   3. Erros:
      1. 404 not found - n achei o produto com esse id
3. **Outras operações futuras**