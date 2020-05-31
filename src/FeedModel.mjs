import Sequelize from 'sequelize'

export const id = 'id'
export const name = 'name'
export const url = 'url'
export const title = 'title'
export const description = 'description'
export const creation_date = 'creation_date'

const attributes = [id, name, url, title, description, creation_date]

const FeedModelBuilder = (sequelize) => {
    const FeedModel = sequelize.define(
        'feeds_feedentry',
        {
            [id]: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            [name]: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            [url]: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            [title]: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            [description]: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            [creation_date]: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        },
        {
            freezeTableName: true,
        }
    )

    const findByName = ({ name, limit = 25 }) =>
        FeedModel.findAll({
            limit: Math.min(parseInt(limit, 10), 500),
            where: {
                name,
            },
            attributes,
            order: [[creation_date, 'DESC']],
        })

    return { FeedModel, findByName }
}

export default FeedModelBuilder
