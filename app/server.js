const express = require('express')
const mysql = require('mysql2')
const { Client } = require('@elastic/elasticsearch')

const app = express()
const port = 3000

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

const esClient = new Client({ node: `http://${process.env.ES_HOST}:9200` })

app.get('/search', async (req, res) => {
  const query = req.query.q
  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  try {
    const { body } = await esClient.search({
      index: 'locations',
      body: {
        query: {
          match: {
            name: query,
          },
        },
      },
    })
    res.json(body.hits.hits.map((hit) => hit._source))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
