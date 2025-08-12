# Cadastro de Fornecedor/Produto — Teste Técnico VFLOWS

Formulário completo para cadastro de **Fornecedor** e **Produtos**, com **anexos**, **cálculo automático**, **validações**, **busca de endereço por CEP (ViaCEP)** e **geração de JSON** para download.

> Tecnologias: **HTML5**, **CSS (Fluig Style Guide)**, **jQuery 3.5.1**. Sem libs extras.

---

## ✨ Preview

### Desktop
<img src="docs/preview-desktop.png" alt="Preview da tela em desktop" width="900" />

### Mobile
<img src="docs/preview-mobile.png" alt="Preview da tela em mobile" width="360" />

---

## 📁 Estrutura do projeto

.
├─ index.html
├─ css/
│ └─ styles.css
├─ js/
│ └─ app.js
└─ docs/
├─ preview-desktop.png
├─ preview-mobile.png
└─ products-section.png

markdown
Copiar
Editar

---

## ▶️ Como executar (2 opções)

### Opção A — Abrir direto no navegador
1. Baixe/clique em **index.html** e abra no seu navegador.
2. **Observação:** algumas APIs bloqueiam requisições quando a página é aberta via `file://`.
   Se o preenchimento automático de CEP não funcionar, use a **Opção B**.

### Opção B — Servidor local recomendado
Use qualquer servidor estático simples:
- **VS Code Live Server** (extensão) — clique em *Go Live* na pasta do projeto; ou
- **Python**: `python -m http.server 5500` e acesse `http://localhost:5500`; ou
- **Node (http-server)**: `npx http-server -p 5500`



## 🧭 Passo a passo de uso

1) **Dados do fornecedor**  
   Preencha *Razão Social, Nome Fantasia, CNPJ, CEP, Endereço, Número, Bairro, Município, UF*, e *Contato (nome, telefone, e-mail)*.  
   - CNPJ e Telefone têm **máscara automática**.  
   - Ao sair do campo **CEP**, o sistema preenche **logradouro/bairro/município/UF** via **ViaCEP**.

2) **Produtos**  
   - Há 2 itens iniciais. Clique em **Adicionar Produto** para criar mais.  
   - Informe **Produto**, **UND. Medida**, **Quantidade** e **Valor Unitário**.  
   - **Valor Total** é **calculado automaticamente** (readonly).  
   - Remova itens pela **lixeira** (não remove o último item).

3) **Anexos**  
   - Clique em **Incluir Anexo** para adicionar arquivos (armazenados em memória/base64).  
   - Em cada item, você pode **Visualizar (download)** ou **Excluir**.

4) **Salvar fornecedor**  
   - O botão **Salvar Fornecedor** valida os campos obrigatórios (form + produtos + ao menos 1 anexo).  
   - Um overlay de carregamento é exibido e, em seguida, é feito o **download do JSON** (também logado no console).


## 🧩 Como funciona (principais pontos)

- **Máscaras**: CNPJ e Telefone com regex simples, além de sanitização/format de campos numéricos.
- **CEP (ViaCEP)**: `GET https://viacep.com.br/ws/{CEP}/json/` e preenchimento automático dos campos de endereço.
- **Produtos**: clonagem do primeiro card como template; cálculo de `valorTotal = quantidade × valorUnitario`.  
  O `valorTotal` é recalculado em cada edição e mantido **readonly**.
- **Anexos**: guardados no `sessionStorage` com `dataURL` (base64). Ações de **ver** (download) e **excluir** atualizam a lista.
- **Salvar**: monta um `payload` com `fornecedor`, `produtos` e `anexos`, baixa o arquivo `fornecedor_<timestamp>.json` e limpa o formulário.

---

## 🗂️ Exemplo de JSON gerado

```json
{
  "fornecedor": {
    "razaoSocial": "Exemplo Ltda",
    "nomeFantasia": "Fornecedor Exemplo",
    "cnpj": "12345678000199",
    "inscricaoEstadual": "123456789",
    "inscricaoMunicipal": "1234567",
    "endereco": {
      "cep": "42702-903",
      "logradouro": "Rua Exemplo",
      "numero": "123",
      "bairro": "Centro",
      "municipio": "Salvador",
      "uf": "BA",
      "complemento": null
    },
    "contato": {
      "nome": "Fulano",
      "telefone": "71999999999",
      "email": "fulano@exemplo.com"
    }
  },
  "produtos": [
    {
      "descricao": "Produto A",
      "unidade": "UN",
      "quantidade": 10,
      "valorUnitario": 5.5,
      "valorTotal": 55
    }
  ],
  "anexos": [
    {
      "nome": "documento.pdf",
      "mime": "application/pdf",
      "tamanho": 12345,
      "base64": "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwv..."
    }
  ]
}
Obs.: O CEP pode aparecer com máscara (XXXXX-XXX) ou apenas dígitos — ambos aceitáveis para o desafio.

✅ Requisitos atendidos (resumo rápido)
 HTML + CSS (Fluig) + jQuery sem libs extras

 Preenchimento automático por CEP (ViaCEP)

 Tabela de produtos dinâmica (add/remove), cálculos e validações

 Tabela de anexos em memória (visualizar=download, excluir)

 Botão “Salvar” com validações + overlay + download do JSON

 Código legível, estrutura de pastas clara, responsivo básico

🔧 Dicas de desenvolvimento
Se abrir index.html direto e a ViaCEP não responder, suba um servidor local (veja Como executar).

Para testes, use o console do navegador (F12) e procure por JSON DE ENVIO:.

📜 Licença
Projeto de teste técnico. Uso livre para fins avaliativos.

makefile
Copiar
Editar
::contentReference[oaicite:0]{index=0}