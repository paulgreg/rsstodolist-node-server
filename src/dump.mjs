import Sequelize from 'sequelize'
import * as env from './env.mjs'
import FeedModelBuilder from './FeedModel.mjs'

const sequelize = new Sequelize(env.DATABASE_URL, {
    timezone: env.TZ,
    dialectOptions: {
        timezone: env.TZ, // Duplicate because of a bug: https://github.com/sequelize/sequelize/issues/10921
    },
    logging: false,
})

const cleanStr = (str) => str ? str.replace(/"/g, '\\"').replace(/[\r\n]/g, '') : ''

sequelize
    .authenticate()
    .then(() => FeedModelBuilder(sequelize).dump())
    .then((results) => {
        console.log(`"name";"url";"title";"description";"createdAt";"updatedAt"`)
        results
            .map(({ dataValues }) => dataValues)
            .forEach(({ name, url, title, description, createdAt, updatedAt }) => {
                console.log(
                    `"${cleanStr(name)}";"${cleanStr(url)}";"${cleanStr(title)}";"${cleanStr(
                        description
                    )}";${createdAt};${updatedAt}`
                )
            })
        process.exit(0)
    })
    .catch((err) => {
        console.error(err)
        throw err
    })
