const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()

const PORT = process.env.PORT || 8080
const CONNECTION_STRING = "postgres://gkjvfsdjqffntr:c09db802c5b3f9553690ea596727dbadc9ca86711e8acaabc122ab17f8a90ef5@ec2-3-214-3-162.compute-1.amazonaws.com:5432/dam1k28i0efu2k"

app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')


app.use(bodyParser.urlencoded({extended: false}))

const db = pgp(CONNECTION_STRING)


app.get('/', async(req,res)=> {

        await db.any('SELECT articleid, title,body FROM articles')
        .then((articles) => {

            res.render('index',{articles: articles})

            

        })

})

app.post('/delete-article', async(req,res) => {

    let blogid = req.body.articleid

await db.none('DELETE FROM articles WHERE articleid = $1', [blogid])

.then(() => {

    res.redirect('/') 

    })
}) 

app.post('/update-article', async(req,res) => {
        
    let title = req.body.title
    let description = req.body.description
    let articleid = req.body.articleid
    
        await db.none('UPDATE articles SET title = $1, body = $2 WHERE articleid = $3',[title,description,articleid] )
    .then(() => {

        res.redirect('/')
    })
})

app.get('/edit/:articleid', async(req,res) => {

        let articleid = req.params.articleid

    await db.one('SELECT articleid,title,body FROM articles WHERE articleid = $1',[articleid])

   .then((article) => {

        res.render('edit-article',article)

   }) 

})


app.get('/add-article',(req,res) => {
  res.render('add-article')
})

app.post('/add-article', async(req,res) => {

  let title = req.body.title
  let description = req.body.description
 

  await db.none('INSERT INTO articles(title,body) VALUES($1,$2)',[title,description])
  .then(() => {
    res.redirect('/')
  })

})



app.listen(PORT,() => {
  console.log(`Server has started on ${PORT}`)
})
