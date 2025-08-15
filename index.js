require('dotenv').config();
const express = require('express');
const pool = require('./src/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota para buscar todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota para buscar um produto por ID
app.get('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM produtos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Produto não encontrado');
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota para criar um novo produto (CREATE)
app.post('/produtos', async (req, res) => {
  console.log('Recebido no corpo:', req.body);  // Para debug
  const { nome, descricao, preco } = req.body;

  // Validação que aceita preco=0 mas não undefined ou null
  if (!nome || preco === undefined || preco === null) {
    return res.status(400).send('Nome e preço são obrigatórios');
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)',
      [nome, descricao, preco]
    );
    res.status(201).json({ id: result.insertId, nome, descricao, preco });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota para atualizar um produto (UPDATE)
app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?',
      [nome, descricao, preco, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send('Produto não encontrado');
    }
    res.status(200).json({ id, nome, descricao, preco });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota para deletar um produto (DELETE)
app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM produtos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send('Produto não encontrado');
    }
    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
