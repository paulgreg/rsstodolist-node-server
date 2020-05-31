import express from 'express'
import parameters from '../parameters.json'
import Sequelize from 'sequelize'
import FeedModelBuilder from './FeedModel'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const { port, database, username, password, host, dialect } = parameters

const sequelize = new Sequelize(database, username, password, {
    host,
    dialect,
})

sequelize
    .authenticate()
    .then(() => {
        console.log(
            `Connection to '${database}' on '${host}' by '${username}' has been established successfully`
        )
    })
    .catch((err) => {
        console.error(
            `Unable to connect to '${database}' on '${host}' by '${username}'`,
            err
        )
        throw err
    })
    .then(() => {
        const { FeedModel, findByName } = FeedModelBuilder(sequelize)

        const app = express()
        app.set('view engine', 'ejs')
        app.set('views', 'src/views')

        app.use('/static', express.static(__dirname + '/static'))
        //app.use(
        //    '/static',
        //    express.static('static', {
        //        index: false,
        //    })
        //)

        app.get('/', (req, res) => {
            const name = req.query.name || req.query.n
            const limit = req.query.limit || req.query.l
            if (name) {
                return findByName({ name, limit }).then((results) => {
                    res.type('text/xml')
                    return res.render('rss', { name, feeds: results })
                })
            }
            return res.render('index')
        })

        app.listen(port, () =>
            console.log(
                `rsstodolist-node-server listening at http://localhost:${port}`
            )
        )
    })
