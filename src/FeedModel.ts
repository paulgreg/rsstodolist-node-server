import type { Optional } from 'sequelize'
import { Sequelize, Model, DataTypes, Op } from 'sequelize'

export const id = 'id'
export const name = 'name'
export const url = 'url'
export const title = 'title'
export const description = 'description'

export const lengths = {
    [name]: 20,
    [url]: 512,
    [title]: 255,
    [description]: 1024,
}

interface FeedAttributes {
    [id]: number
    [name]: string
    [url]: string
    [title]: string
    [description]?: string
    createdAt?: Date
    updatedAt?: Date
}

interface FeedCreationAttributes extends Optional<FeedAttributes, 'id'> {}

class FeedModel extends Model<FeedAttributes, FeedCreationAttributes> implements FeedAttributes {
    [id]!: number;
    [name]!: string;
    [url]!: string;
    [title]!: string;
    [description]?: string

    readonly createdAt!: Date
    readonly updatedAt!: Date
}

const FeedModelBuilder = (sequelize: Sequelize) => {
    const isPostgres = sequelize.getDialect() === 'postgres'

    const FeedModel = sequelize.define<FeedModel>(
        'feeds_feedentry',
        {
            [id]: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            [name]: {
                type: DataTypes.STRING(lengths[name]),
                allowNull: false,
            },
            [url]: {
                type: DataTypes.STRING(lengths[url]),
                allowNull: false,
            },
            [title]: {
                type: DataTypes.STRING(lengths[title]),
                allowNull: false,
            },
            [description]: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            freezeTableName: true,
        }
    )

    const findByName = async ({ name, limit }: { name: string; limit?: number }) =>
        FeedModel.findAll({
            limit: Math.min(limit ?? 25, 500),
            where: {
                name,
            },
            order: [
                ['updatedAt', isPostgres ? 'DESC NULLS LAST' : 'DESC'],
                ['createdAt', 'DESC'],
            ],
        })

    const insert = async ({ name, url, title, description }: FeedCreationAttributes) =>
        FeedModel.findOne({
            where: { name, url },
        }).then((result) =>
            FeedModel.upsert({
                id: result?.id || undefined,
                name,
                url,
                title,
                description,
            })
        )

    const remove = async ({ name, url }: { name: string; url: string }) =>
        FeedModel.findOne({
            where: { name, url },
        }).then((m) => m?.destroy())

    const list = async () =>
        FeedModel.findAll({
            group: ['name'],
            attributes: ['name', [sequelize.fn('COUNT', sequelize.col('name')), 'count']],
            order: [['name', 'ASC']],
        })

    const count = async ({ name }: { name: string }) =>
        FeedModel.findAll({
            where: { name },
            attributes: [[sequelize.fn('COUNT', sequelize.col('name')), 'count']],
        })

    const search = async ({ query, limit }: { query: string; limit?: number }) =>
        FeedModel.findAll({
            limit: Math.min(limit || 100, 500),
            where: {
                [Op.or]: [
                    {
                        url: {
                            [Op.like]: `%${query}%`,
                        },
                    },
                    {
                        title: {
                            [Op.like]: `%${query}%`,
                        },
                    },
                    {
                        description: {
                            [Op.like]: `%${query}%`,
                        },
                    },
                ],
            },
            order: [
                ['updatedAt', 'DESC'],
                ['createdAt', 'DESC'],
            ],
        })

    const suggest = async ({ query }: { query: string }) =>
        FeedModel.findAll({
            limit: 10,
            group: ['name'],
            attributes: ['name', [sequelize.fn('COUNT', sequelize.col('name')), 'count']],
            where: {
                name: {
                    [Op.like]: `%${query}%`,
                },
            },
            order: [['name', 'ASC']],
        })

    const dump = async () =>
        FeedModel.findAll({
            attributes: ['name', 'url', 'title', 'description', 'createdAt', 'updatedAt'],
            order: [
                ['name', 'ASC'],
                ['updatedAt', 'DESC'],
                ['createdAt', 'DESC'],
            ],
        })

    return { FeedModel, findByName, insert, remove, list, count, search, suggest, dump }
}

export default FeedModelBuilder
