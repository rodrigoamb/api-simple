const express = require("express");
const { Client } = require("pg");

const app = express();
const PORT = 3000;

app.use(express.json());

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "dc_store_online",
  password: "30267098",
  port: 5432,
});

client
  .connect()
  .then(async () => {
    console.log("Conectado ao PostgreSQL!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        telefone VARCHAR(15)
      );

      CREATE TABLE IF NOT EXISTS enderecos (
        id SERIAL PRIMARY KEY,
        cliente_id INT,
        rua VARCHAR(100),
        cidade VARCHAR(50),
        estado VARCHAR(2),
        cep VARCHAR(9),
        CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        preco NUMERIC(10,2) NOT NULL,
        estoque INT DEFAULT 0,
        categoria_id INT,
        CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente_id INT,
        data_pedido DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'pendente',
        CONSTRAINT fk_cliente_pedido FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pagamentos (
        id SERIAL PRIMARY KEY,
        pedido_id INT UNIQUE,
        valor NUMERIC(10,2),
        forma_pagamento VARCHAR(50),
        status_pagamento VARCHAR(30),
        CONSTRAINT fk_pagamento_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pedido_itens (
        id SERIAL PRIMARY KEY,
        pedido_id INT,
        produto_id INT,
        quantidade INT,
        preco_unitario NUMERIC(10,2),
        CONSTRAINT fk_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log("Tabelas verificadas/criadas com sucesso!");
  })
  .catch((err) => console.error("Erro ao conectar no banco:", err));

// ---------- CLIENTES ----------
app.get("/clientes", async (req, res) => {
  const result = await client.query("SELECT * FROM clientes");
  res.json(result.rows);
});

app.get("/clientes/:id", async (req, res) => {
  const result = await client.query("SELECT * FROM clientes WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

app.post("/clientes", async (req, res) => {
  const { nome, email, telefone } = req.body;
  await client.query(
    "INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3)",
    [nome, email, telefone]
  );
  res.status(201).json({ message: "Cliente criado!" });
});

app.put("/clientes/:id", async (req, res) => {
  const { nome, email, telefone } = req.body;
  await client.query(
    "UPDATE clientes SET nome = $1, email = $2, telefone = $3 WHERE id = $4",
    [nome, email, telefone, req.params.id]
  );
  res.json({ message: "Cliente atualizado!" });
});

app.delete("/clientes/:id", async (req, res) => {
  await client.query("DELETE FROM clientes WHERE id = $1", [req.params.id]);
  res.json({ message: "Cliente deletado!" });
});

// ---------- ENDERECOS ----------
app.get("/enderecos", async (req, res) => {
  const result = await client.query("SELECT * FROM enderecos");
  res.json(result.rows);
});

app.get("/enderecos/:id", async (req, res) => {
  const result = await client.query("SELECT * FROM enderecos WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

app.post("/enderecos", async (req, res) => {
  const { cliente_id, rua, cidade, estado, cep } = req.body;
  await client.query(
    "INSERT INTO enderecos (cliente_id, rua, cidade, estado, cep) VALUES ($1, $2, $3, $4, $5)",
    [cliente_id, rua, cidade, estado, cep]
  );
  res.status(201).json({ message: "Endereço criado!" });
});

app.put("/enderecos/:id", async (req, res) => {
  const { cliente_id, rua, cidade, estado, cep } = req.body;
  await client.query(
    "UPDATE enderecos SET cliente_id = $1, rua = $2, cidade = $3, estado = $4, cep = $5 WHERE id = $6",
    [cliente_id, rua, cidade, estado, cep, req.params.id]
  );
  res.json({ message: "Endereço atualizado!" });
});

app.delete("/enderecos/:id", async (req, res) => {
  await client.query("DELETE FROM enderecos WHERE id = $1", [req.params.id]);
  res.json({ message: "Endereço deletado!" });
});

// ---------- CATEGORIAS ----------
app.get("/categorias", async (req, res) => {
  const result = await client.query("SELECT * FROM categorias");
  res.json(result.rows);
});

app.get("/categorias/:id", async (req, res) => {
  const result = await client.query("SELECT * FROM categorias WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

app.post("/categorias", async (req, res) => {
  const { nome } = req.body;
  await client.query("INSERT INTO categorias (nome) VALUES ($1)", [nome]);
  res.status(201).json({ message: "Categoria criada!" });
});

app.put("/categorias/:id", async (req, res) => {
  const { nome } = req.body;
  await client.query("UPDATE categorias SET nome = $1 WHERE id = $2", [
    nome,
    req.params.id,
  ]);
  res.json({ message: "Categoria atualizada!" });
});

app.delete("/categorias/:id", async (req, res) => {
  await client.query("DELETE FROM categorias WHERE id = $1", [req.params.id]);
  res.json({ message: "Categoria deletada!" });
});

// ---------- PRODUTOS ----------
app.get("/produtos", async (req, res) => {
  const result = await client.query("SELECT * FROM produtos");
  res.json(result.rows);
});

app.get("/produtos/:id", async (req, res) => {
  const result = await client.query("SELECT * FROM produtos WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

app.post("/produtos", async (req, res) => {
  const { nome, preco, estoque, categoria_id } = req.body;
  await client.query(
    "INSERT INTO produtos (nome, preco, estoque, categoria_id) VALUES ($1, $2, $3, $4)",
    [nome, preco, estoque, categoria_id]
  );
  res.status(201).json({ message: "Produto criado!" });
});

app.put("/produtos/:id", async (req, res) => {
  const { nome, preco, estoque, categoria_id } = req.body;
  await client.query(
    "UPDATE produtos SET nome = $1, preco = $2, estoque = $3, categoria_id = $4 WHERE id = $5",
    [nome, preco, estoque, categoria_id, req.params.id]
  );
  res.json({ message: "Produto atualizado!" });
});

app.delete("/produtos/:id", async (req, res) => {
  await client.query("DELETE FROM produtos WHERE id = $1", [req.params.id]);
  res.json({ message: "Produto deletado!" });
});

// ---------- PEDIDOS ----------
app.get("/pedidos", async (req, res) => {
  const result = await client.query("SELECT * FROM pedidos");
  res.json(result.rows);
});

app.get("/pedidos/:id", async (req, res) => {
  const result = await client.query("SELECT * FROM pedidos WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

app.post("/pedidos", async (req, res) => {
  const { cliente_id, status } = req.body;
  await client.query(
    "INSERT INTO pedidos (cliente_id, status) VALUES ($1, $2)",
    [cliente_id, status]
  );
  res.status(201).json({ message: "Pedido criado!" });
});

app.put("/pedidos/:id", async (req, res) => {
  const { cliente_id, status } = req.body;
  await client.query(
    "UPDATE pedidos SET cliente_id = $1, status = $2 WHERE id = $3",
    [cliente_id, status, req.params.id]
  );
  res.json({ message: "Pedido atualizado!" });
});

app.delete("/pedidos/:id", async (req, res) => {
  await client.query("DELETE FROM pedidos WHERE id = $1", [req.params.id]);
  res.json({ message: "Pedido deletado!" });
});

// ---------- PAGAMENTOS ----------
app.get("/pagamentos", async (req, res) => {
  const result = await client.query("SELECT * FROM pagamentos");
  res.json(result.rows);
});

app.get("/pagamentos/:id", async (req, res) => {
  const result = await client.query("SELECT * FROM pagamentos WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

app.post("/pagamentos", async (req, res) => {
  const { pedido_id, valor, forma_pagamento, status_pagamento } = req.body;
  await client.query(
    "INSERT INTO pagamentos (pedido_id, valor, forma_pagamento, status_pagamento) VALUES ($1, $2, $3, $4)",
    [pedido_id, valor, forma_pagamento, status_pagamento]
  );
  res.status(201).json({ message: "Pagamento registrado!" });
});

app.put("/pagamentos/:id", async (req, res) => {
  const { pedido_id, valor, forma_pagamento, status_pagamento } = req.body;
  await client.query(
    "UPDATE pagamentos SET pedido_id = $1, valor = $2, forma_pagamento = $3, status_pagamento = $4 WHERE id = $5",
    [pedido_id, valor, forma_pagamento, status_pagamento, req.params.id]
  );
  res.json({ message: "Pagamento atualizado!" });
});

app.delete("/pagamentos/:id", async (req, res) => {
  await client.query("DELETE FROM pagamentos WHERE id = $1", [req.params.id]);
  res.json({ message: "Pagamento deletado!" });
});

// ---------- PEDIDO_ITENS ----------
app.get("/pedido_itens", async (req, res) => {
  const result = await client.query("SELECT * FROM pedido_itens");
  res.json(result.rows);
});

app.get("/pedido_itens/:id", async (req, res) => {
  const result = await client.query(
    "SELECT * FROM pedido_itens WHERE id = $1",
    [req.params.id]
  );
  res.json(result.rows[0]);
});

app.post("/pedido_itens", async (req, res) => {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  await client.query(
    "INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)",
    [pedido_id, produto_id, quantidade, preco_unitario]
  );
  res.status(201).json({ message: "Item adicionado ao pedido!" });
});

app.put("/pedido_itens/:id", async (req, res) => {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  await client.query(
    "UPDATE pedido_itens SET pedido_id = $1, produto_id = $2, quantidade = $3, preco_unitario = $4 WHERE id = $5",
    [pedido_id, produto_id, quantidade, preco_unitario, req.params.id]
  );
  res.json({ message: "Item do pedido atualizado!" });
});

app.delete("/pedido_itens/:id", async (req, res) => {
  await client.query("DELETE FROM pedido_itens WHERE id = $1", [req.params.id]);
  res.json({ message: "Item do pedido deletado!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
