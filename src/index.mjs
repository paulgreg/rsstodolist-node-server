import express from 'express'
import Sequelize from 'sequelize'
import FeedModelBuilder, { lengths } from './FeedModel.mjs'
import axios from 'axios'
import cheerio from 'cheerio'
import morgan from 'morgan'
import { truncate, slugify, cleanify } from './strings.mjs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import jschardet from 'jschardet'
import charset from 'charset'
import iconv from 'iconv-lite'
import * as env from './env.mjs'

const publicPort = env.CONTAINER_EXT_PORT || env.PORT
const __dirname = dirname(fileURLToPath(import.meta.url))

const sequelize = new Sequelize(env.DB_URL, {
    timezone: env.TZ,
    dialectOptions: {
        timezone: env.TZ, // Duplicate because of a bug: https://github.com/sequelize/sequelize/issues/10921
    },
})

axios.interceptors.response.use((response) => {
    const chardetResult = jschardet.detect(response.data)
    const encoding =
        (chardetResult && chardetResult.encoding) ||
        charset(response.headers, response.data)

    response.data = iconv.decode(response.data, encoding)

    return response
})

sequelize
    .authenticate()
    .then(() => {
        console.log(`Connection to database has been established successfully`)
    })
    .catch((err) => {
        console.error(`Unable to connect to database`, err)
        throw err
    })
    .then(() => {
        const { findByName, list, insert, remove } = FeedModelBuilder(sequelize)

        const app = express()
        app.set('view engine', 'ejs')
        app.set('views', 'src/views')

        app.use(
            morgan(
                ':method :url :status :res[content-length] - :response-time ms'
            )
        )
        app.use(cors())

        app.use(
            '/static',
            express.static(__dirname + '/static', { index: false })
        )

        app.get('/', (req, res) => {
            const rootUrl = req.protocol + '://' + req.get('host')
            const n = req.query.name || req.query.n
            const name = slugify(truncate(cleanify(n), lengths.name))
            const limit =
                Math.abs(parseInt(req.query.limit || req.query.l, 10)) || 25
            if (name) {
                if (n !== name) return res.redirect(302, `./?n=${name}`)

                return findByName({ name, limit }).then((entries) => {
                    res.type('text/xml')
                    return res.render('rss', { rootUrl, name, entries })
                })
            }
            return res.render('index')
        })

        app.get('/list', (req, res) =>
            list().then((feeds) => res.render('list', { feeds }))
        )

        app.get('/add', (req, res) => {
            const n = req.query.name || req.query.n
            const name = slugify(truncate(cleanify(n), lengths.name))
            const url = truncate(req.query.url || req.query.u, lengths.url)
            const title = truncate(
                cleanify(req.query.title || req.query.t),
                lengths.title
            )
            const description = truncate(
                cleanify(req.query.description || req.query.d),
                lengths.description
            )

            if (!name || !url) {
                return res.status(404).end('404 : Missing name or url')
            }
            return (title
                ? Promise.resolve({ title, description })
                : Promise.resolve().then(() =>
                      axios
                          .get(encodeURI(url), {
                              responseType: 'arraybuffer',
                              headers: {
                                  'User-Agent':
                                      'Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0',
                              },
                          })
                          .then(function (response = {}) {
                              const { status, data } = response
                              if (status === 200) {
                                  const $ = cheerio.load(data, {
                                      normalizeWhitespace: true,
                                      xmlMode: false,
                                      decodeEntities: true,
                                  })

                                  const titleFromPage =
                                      $('head title').text() ||
                                      $('body title').text()
                                  return {
                                      title: truncate(
                                          cleanify(titleFromPage),
                                          lengths.title
                                      ),
                                      description: truncate(
                                          cleanify(
                                              $(
                                                  'head meta[name=description]'
                                              ).attr('content')
                                          ),
                                          lengths.description
                                      ),
                                  }
                              }
                          })
                          .catch(function (error) {
                              console.log(error)
                          })
                  )
            )
                .then((metas = {}) => {
                    const { title, description } = metas
                    return insert({ name, url, title, description })
                })
                .then(() => res.redirect(302, `./?n=${name}`))
                .catch((err) => {
                    const msg = `Error while inserting '${url}' in '${name}'`
                    console.error(msg, err)
                    res.sendStatus(500).end(msg)
                })
        })

        app.get('/del', (req, res) => {
            const n = req.query.name || req.query.n
            const name = slugify(truncate(cleanify(n), lengths.name))
            const url = truncate(req.query.url || req.query.u, lengths.url)
            if (!name || !url) {
                return res.status(404).end('404 : Missing name or url')
            }
            return remove({ name, url })
                .then(() => res.redirect(302, `./?n=${name}`))
                .catch((err) => {
                    const msg = `Error while removing '${url}' in '${name}'`
                    console.error(msg, err)
                    res.sendStatus(500).end(msg)
                })
        })

        app.listen(env.PORT, () => {
            console.log(
                `rsstodolist-node-server listening at http://localhost:${publicPort}`
            )
        })
    })
